# Check-In/Check-Out Implementation Guide

This guide provides detailed instructions for implementing the check-in/check-out functionality in the Apartment Rental module of the Rental & Expense Management App.

## 1. Overview

The check-in/check-out functionality allows tracking of guest arrivals and departures for apartment bookings. This feature enables accurate calculation of stay duration, proper billing, and management of apartment availability.

## 2. Database Implementation

### 2.1 ApartmentBookings Table

The `ApartmentBookings` table needs to include the following fields to support check-in/check-out functionality:

```sql
CREATE TABLE ApartmentBookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  apartment_id INTEGER NOT NULL,
  guest_name TEXT NOT NULL,
  contact_info TEXT,
  check_in_datetime DATETIME NOT NULL,
  check_out_datetime DATETIME NOT NULL,
  actual_check_in_datetime DATETIME,
  actual_check_out_datetime DATETIME,
  booking_status TEXT NOT NULL DEFAULT 'booked', -- booked, checked-in, checked-out, cancelled
  amount DECIMAL(10, 2) NOT NULL,
  paid_status TEXT NOT NULL DEFAULT 'unpaid', -- unpaid, partially_paid, paid
  notes TEXT,
  doc_urls TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (apartment_id) REFERENCES Apartments(id) ON DELETE CASCADE
);
```

### 2.2 Sequelize Model

```javascript
// backend/models/ApartmentBooking.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Apartment = require('./Apartment');

const ApartmentBooking = sequelize.define('ApartmentBooking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  apartment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Apartment,
      key: 'id'
    }
  },
  guest_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contact_info: {
    type: DataTypes.STRING
  },
  check_in_datetime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  check_out_datetime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  actual_check_in_datetime: {
    type: DataTypes.DATE
  },
  actual_check_out_datetime: {
    type: DataTypes.DATE
  },
  booking_status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'booked',
    validate: {
      isIn: [['booked', 'checked-in', 'checked-out', 'cancelled']]
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paid_status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'unpaid',
    validate: {
      isIn: [['unpaid', 'partially_paid', 'paid']]
    }
  },
  notes: {
    type: DataTypes.TEXT
  },
  doc_urls: {
    type: DataTypes.TEXT,
    get() {
      const value = this.getDataValue('doc_urls');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('doc_urls', JSON.stringify(value));
    }
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Define association
ApartmentBooking.belongsTo(Apartment, { foreignKey: 'apartment_id' });
Apartment.hasMany(ApartmentBooking, { foreignKey: 'apartment_id' });

module.exports = ApartmentBooking;
```

## 3. Backend Implementation

### 3.1 Controller Methods

Add the following methods to the `ApartmentBookingController`:

```javascript
// backend/controllers/apartmentBookingController.js
const ApartmentBooking = require('../models/ApartmentBooking');
const Apartment = require('../models/Apartment');
const { Op } = require('sequelize');

// Check for booking conflicts
const checkBookingConflicts = async (apartmentId, checkInDate, checkOutDate, bookingId = null) => {
  const whereClause = {
    apartment_id: apartmentId,
    booking_status: {
      [Op.notIn]: ['cancelled', 'checked-out']
    },
    [Op.or]: [
      {
        // New booking starts during an existing booking
        check_in_datetime: {
          [Op.lt]: checkOutDate
        },
        check_out_datetime: {
          [Op.gt]: checkInDate
        }
      }
    ]
  };
  
  // Exclude the current booking when updating
  if (bookingId) {
    whereClause.id = {
      [Op.ne]: bookingId
    };
  }
  
  const conflictingBookings = await ApartmentBooking.findAll({
    where: whereClause
  });
  
  return conflictingBookings;
};

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const {
      apartment_id,
      guest_name,
      contact_info,
      check_in_datetime,
      check_out_datetime,
      amount,
      paid_status,
      notes
    } = req.body;
    
    // Validate required fields
    if (!apartment_id || !guest_name || !check_in_datetime || !check_out_datetime || !amount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check if apartment exists
    const apartment = await Apartment.findByPk(apartment_id);
    if (!apartment) {
      return res.status(404).json({ message: 'Apartment not found' });
    }
    
    // Convert dates to Date objects
    const checkInDate = new Date(check_in_datetime);
    const checkOutDate = new Date(check_out_datetime);
    
    // Validate dates
    if (checkInDate >= checkOutDate) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date' });
    }
    
    // Check for booking conflicts
    const conflictingBookings = await checkBookingConflicts(apartment_id, checkInDate, checkOutDate);
    if (conflictingBookings.length > 0) {
      return res.status(409).json({
        message: 'Booking conflicts with existing bookings',
        conflicts: conflictingBookings
      });
    }
    
    // Create the booking
    const booking = await ApartmentBooking.create({
      apartment_id,
      guest_name,
      contact_info,
      check_in_datetime: checkInDate,
      check_out_datetime: checkOutDate,
      amount,
      paid_status: paid_status || 'unpaid',
      notes,
      booking_status: 'booked'
    });
    
    return res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    return res.status(500).json({ message: 'Error creating booking', error: error.message });
  }
};

// Check-in a guest
exports.checkIn = async (req, res) => {
  try {
    const { id } = req.params;
    const { actual_check_in_datetime, notes } = req.body;
    
    // Find the booking
    const booking = await ApartmentBooking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Validate booking status
    if (booking.booking_status !== 'booked') {
      return res.status(400).json({
        message: `Cannot check in. Booking is already ${booking.booking_status}`
      });
    }
    
    // Update the booking
    booking.booking_status = 'checked-in';
    booking.actual_check_in_datetime = actual_check_in_datetime || new Date();
    if (notes) {
      booking.notes = booking.notes ? `${booking.notes}\n\nCheck-in: ${notes}` : `Check-in: ${notes}`;
    }
    
    await booking.save();
    
    return res.status(200).json(booking);
  } catch (error) {
    console.error('Error checking in:', error);
    return res.status(500).json({ message: 'Error checking in', error: error.message });
  }
};

// Check-out a guest
exports.checkOut = async (req, res) => {
  try {
    const { id } = req.params;
    const { actual_check_out_datetime, final_amount, notes } = req.body;
    
    // Find the booking
    const booking = await ApartmentBooking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Validate booking status
    if (booking.booking_status !== 'checked-in') {
      return res.status(400).json({
        message: `Cannot check out. Booking is ${booking.booking_status}, not checked-in`
      });
    }
    
    // Update the booking
    booking.booking_status = 'checked-out';
    booking.actual_check_out_datetime = actual_check_out_datetime || new Date();
    
    // Update amount if provided
    if (final_amount) {
      booking.amount = final_amount;
    }
    
    if (notes) {
      booking.notes = booking.notes ? `${booking.notes}\n\nCheck-out: ${notes}` : `Check-out: ${notes}`;
    }
    
    await booking.save();
    
    return res.status(200).json(booking);
  } catch (error) {
    console.error('Error checking out:', error);
    return res.status(500).json({ message: 'Error checking out', error: error.message });
  }
};

// Cancel a booking
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    
    // Find the booking
    const booking = await ApartmentBooking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Validate booking status
    if (booking.booking_status === 'checked-out' || booking.booking_status === 'cancelled') {
      return res.status(400).json({
        message: `Cannot cancel. Booking is already ${booking.booking_status}`
      });
    }
    
    // Update the booking
    booking.booking_status = 'cancelled';
    
    if (notes) {
      booking.notes = booking.notes ? `${booking.notes}\n\nCancellation: ${notes}` : `Cancellation: ${notes}`;
    }
    
    await booking.save();
    
    return res.status(200).json(booking);
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return res.status(500).json({ message: 'Error cancelling booking', error: error.message });
  }
};

// Get booking details
exports.getBooking = async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await ApartmentBooking.findByPk(id, {
      include: [
        {
          model: Apartment,
          attributes: ['id', 'name', 'description']
        }
      ]
    });
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    return res.status(200).json(booking);
  } catch (error) {
    console.error('Error getting booking:', error);
    return res.status(500).json({ message: 'Error getting booking', error: error.message });
  }
};

// Get all bookings for an apartment
exports.getApartmentBookings = async (req, res) => {
  try {
    const { apartmentId } = req.params;
    const { status, startDate, endDate } = req.query;
    
    // Build where clause
    const whereClause = {
      apartment_id: apartmentId
    };
    
    // Filter by status if provided
    if (status) {
      whereClause.booking_status = status;
    }
    
    // Filter by date range if provided
    if (startDate && endDate) {
      whereClause[Op.or] = [
        {
          check_in_datetime: {
            [Op.between]: [new Date(startDate), new Date(endDate)]
          }
        },
        {
          check_out_datetime: {
            [Op.between]: [new Date(startDate), new Date(endDate)]
          }
        },
        {
          [Op.and]: [
            {
              check_in_datetime: {
                [Op.lte]: new Date(startDate)
              }
            },
            {
              check_out_datetime: {
                [Op.gte]: new Date(endDate)
              }
            }
          ]
        }
      ];
    }
    
    const bookings = await ApartmentBooking.findAll({
      where: whereClause,
      include: [
        {
          model: Apartment,
          attributes: ['id', 'name', 'description']
        }
      ],
      order: [['check_in_datetime', 'DESC']]
    });
    
    return res.status(200).json(bookings);
  } catch (error) {
    console.error('Error getting apartment bookings:', error);
    return res.status(500).json({ message: 'Error getting apartment bookings', error: error.message });
  }
};

// Calculate stay duration and amount
exports.calculateStayDetails = async (req, res) => {
  try {
    const { check_in_datetime, check_out_datetime, rate_per_night } = req.body;
    
    if (!check_in_datetime || !check_out_datetime || !rate_per_night) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const checkInDate = new Date(check_in_datetime);
    const checkOutDate = new Date(check_out_datetime);
    
    // Validate dates
    if (checkInDate >= checkOutDate) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date' });
    }
    
    // Calculate duration in milliseconds
    const durationMs = checkOutDate.getTime() - checkInDate.getTime();
    
    // Convert to days (rounded up to the nearest day)
    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
    
    // Calculate amount
    const amount = durationDays * rate_per_night;
    
    return res.status(200).json({
      check_in_datetime: checkInDate,
      check_out_datetime: checkOutDate,
      duration_days: durationDays,
      rate_per_night,
      amount
    });
  } catch (error) {
    console.error('Error calculating stay details:', error);
    return res.status(500).json({ message: 'Error calculating stay details', error: error.message });
  }
};
```

### 3.2 Routes

Add the following routes to handle check-in/check-out functionality:

```javascript
// backend/routes/apartmentBookings.js
const express = require('express');
const router = express.Router();
const apartmentBookingController = require('../controllers/apartmentBookingController');
const auth = require('../middleware/auth');

// Get all bookings for an apartment
router.get('/apartments/:apartmentId/bookings', auth, apartmentBookingController.getApartmentBookings);

// Get booking details
router.get('/bookings/:id', auth, apartmentBookingController.getBooking);

// Create a new booking
router.post('/bookings', auth, apartmentBookingController.createBooking);

// Update a booking
router.put('/bookings/:id', auth, apartmentBookingController.updateBooking);

// Check-in a guest
router.post('/bookings/:id/check-in', auth, apartmentBookingController.checkIn);

// Check-out a guest
router.post('/bookings/:id/check-out', auth, apartmentBookingController.checkOut);

// Cancel a booking
router.post('/bookings/:id/cancel', auth, apartmentBookingController.cancelBooking);

// Calculate stay details
router.post('/bookings/calculate', auth, apartmentBookingController.calculateStayDetails);

module.exports = router;
```

## 4. Frontend Implementation

### 4.1 Booking Form Component

Create a Vue component for the booking form with check-in/check-out functionality:

```vue
<!-- frontend/src/components/apartments/BookingForm.vue -->
<template>
  <div class="booking-form">
    <h3>{{ editMode ? 'Edit Booking' : 'New Booking' }}</h3>
    
    <form @submit.prevent="submitForm">
      <div class="form-group">
        <label for="guest_name">Guest Name *</label>
        <input
          type="text"
          id="guest_name"
          v-model="booking.guest_name"
          class="form-control"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="contact_info">Contact Information</label>
        <input
          type="text"
          id="contact_info"
          v-model="booking.contact_info"
          class="form-control"
        />
      </div>
      
      <div class="form-row">
        <div class="form-group col-md-6">
          <label for="check_in_date">Check-in Date *</label>
          <input
            type="date"
            id="check_in_date"
            v-model="checkInDate"
            class="form-control"
            required
            @change="calculateAmount"
          />
        </div>
        <div class="form-group col-md-6">
          <label for="check_in_time">Check-in Time *</label>
          <input
            type="time"
            id="check_in_time"
            v-model="checkInTime"
            class="form-control"
            required
            @change="calculateAmount"
          />
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group col-md-6">
          <label for="check_out_date">Check-out Date *</label>
          <input
            type="date"
            id="check_out_date"
            v-model="checkOutDate"
            class="form-control"
            required
            @change="calculateAmount"
          />
        </div>
        <div class="form-group col-md-6">
          <label for="check_out_time">Check-out Time *</label>
          <input
            type="time"
            id="check_out_time"
            v-model="checkOutTime"
            class="form-control"
            required
            @change="calculateAmount"
          />
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group col-md-6">
          <label for="rate_per_night">Rate per Night *</label>
          <div class="input-group">
            <div class="input-group-prepend">
              <span class="input-group-text">₹</span>
            </div>
            <input
              type="number"
              id="rate_per_night"
              v-model="ratePerNight"
              class="form-control"
              min="0"
              step="0.01"
              required
              @change="calculateAmount"
            />
          </div>
        </div>
        <div class="form-group col-md-6">
          <label for="amount">Total Amount *</label>
          <div class="input-group">
            <div class="input-group-prepend">
              <span class="input-group-text">₹</span>
            </div>
            <input
              type="number"
              id="amount"
              v-model="booking.amount"
              class="form-control"
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>
      </div>
      
      <div class="form-group">
        <label for="paid_status">Payment Status *</label>
        <select
          id="paid_status"
          v-model="booking.paid_status"
          class="form-control"
          required
        >
          <option value="unpaid">Unpaid</option>
          <option value="partially_paid">Partially Paid</option>
          <option value="paid">Paid</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="notes">Notes</label>
        <textarea
          id="notes"
          v-model="booking.notes"
          class="form-control"
          rows="3"
        ></textarea>
      </div>
      
      <div class="form-group">
        <label>Documents</label>
        <document-upload
          entity-type="bookings"
          :entity-id="editMode ? booking.id : 0"
          @upload-success="onDocumentUpload"
        />
      </div>
      
      <div class="form-group">
        <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
          {{ editMode ? 'Update Booking' : 'Create Booking' }}
        </button>
        <button type="button" class="btn btn-secondary ml-2" @click="cancel">
          Cancel
        </button>
      </div>
    </form>
    
    <div v-if="errorMessage" class="alert alert-danger mt-3">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import apartmentService from '@/services/apartments';
import DocumentUpload from '@/components/common/DocumentUpload.vue';

export default {
  name: 'BookingForm',
  components: {
    DocumentUpload
  },
  props: {
    apartmentId: {
      type: [String, Number],
      required: true
    },
    bookingId: {
      type: [String, Number],
      default: null
    }
  },
  setup(props) {
    const router = useRouter();
    const booking = ref({
      apartment_id: props.apartmentId,
      guest_name: '',
      contact_info: '',
      check_in_datetime: '',
      check_out_datetime: '',
      amount: 0,
      paid_status: 'unpaid',
      notes: '',
      doc_urls: []
    });
    const checkInDate = ref('');
    const checkInTime = ref('12:00');
    const checkOutDate = ref('');
    const checkOutTime = ref('10:00');
    const ratePerNight = ref(1000);
    const isSubmitting = ref(false);
    const errorMessage = ref('');
    const editMode = computed(() => !!props.bookingId);
    
    // Load booking data if in edit mode
    onMounted(async () => {
      if (editMode.value) {
        try {
          const response = await apartmentService.getBooking(props.bookingId);
          booking.value = response.data;
          
          // Parse dates and times
          const checkIn = new Date(booking.value.check_in_datetime);
          const checkOut = new Date(booking.value.check_out_datetime);
          
          checkInDate.value = formatDate(checkIn);
          checkInTime.value = formatTime(checkIn);
          checkOutDate.value = formatDate(checkOut);
          checkOutTime.value = formatTime(checkOut);
          
          // Calculate rate per night
          const durationMs = checkOut.getTime() - checkIn.getTime();
          const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
          ratePerNight.value = booking.value.amount / durationDays;
        } catch (error) {
          console.error('Error loading booking:', error);
          errorMessage.value = 'Error loading booking details. Please try again.';
        }
      }
    });
    
    // Format date to YYYY-MM-DD
    const formatDate = (date) => {
      const d = new Date(date);
      let month = '' + (d.getMonth() + 1);
      let day = '' + d.getDate();
      const year = d.getFullYear();
      
      if (month.length < 2) month = '0' + month;
      if (day.length < 2) day = '0' + day;
      
      return [year, month, day].join('-');
    };
    
    // Format time to HH:MM
    const formatTime = (date) => {
      const d = new Date(date);
      let hours = '' + d.getHours();
      let minutes = '' + d.getMinutes();
      
      if (hours.length < 2) hours = '0' + hours;
      if (minutes.length < 2) minutes = '0' + minutes;
      
      return [hours, minutes].join(':');
    };
    
    // Calculate check-in datetime
    const getCheckInDateTime = () => {
      if (!checkInDate.value || !checkInTime.value) return null;
      const [hours, minutes] = checkInTime.value.split(':');
      const date = new Date(checkInDate.value);
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      return date;
    };
    
    // Calculate check-out datetime
    const getCheckOutDateTime = () => {
      if (!checkOutDate.value || !checkOutTime.value) return null;
      const [hours, minutes] = checkOutTime.value.split(':');
      const date = new Date(checkOutDate.value);
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      return date;
    };
    
    // Calculate amount based on dates and rate
    const calculateAmount = async () => {
      const checkInDateTime = getCheckInDateTime();
      const checkOutDateTime = getCheckOutDateTime();
      
      if (!checkInDateTime || !checkOutDateTime || !ratePerNight.value) {
        return;
      }
      
      try {
        const response = await apartmentService.calculateStayDetails({
          check_in_datetime: checkInDateTime,
          check_out_datetime: checkOutDateTime,
          rate_per_night: ratePerNight.value
        });
        
        booking.value.amount = response.data.amount;
      } catch (error) {
        console.error('Error calculating amount:', error);
        errorMessage.value = error.response?.data?.message || 'Error calculating amount. Please check dates.';
      }
    };
    
    // Handle document upload
    const onDocumentUpload = (files) => {
      // If we're in create mode, we'll handle the documents after creating the booking
      if (!editMode.value) {
        return;
      }
      
      // In edit mode, update the booking's doc_urls
      booking.value.doc_urls = [...booking.value.doc_urls, ...files];
    };
    
    // Submit the form
    const submitForm = async () => {
      errorMessage.value = '';
      isSubmitting.value = true;
      
      try {
        // Set datetime values
        booking.value.check_in_datetime = getCheckInDateTime();
        booking.value.check_out_datetime = getCheckOutDateTime();
        
        if (booking.value.check_in_datetime >= booking.value.check_out_datetime) {
          errorMessage.value = 'Check-out date must be after check-in date';
          isSubmitting.value = false;
          return;
        }
        
        let response;
        
        if (editMode.value) {
          // Update existing booking
          response = await apartmentService.updateBooking(props.bookingId, booking.value);
        } else {
          // Create new booking
          response = await apartmentService.createBooking(booking.value);
        }
        
        // Navigate to booking details
        router.push(`/apartments/${props.apartmentId}/bookings/${response.data.id}`);
      } catch (error) {
        console.error('Error saving booking:', error);
        errorMessage.value = error.response?.data?.message || 'Error saving booking. Please try again.';
      } finally {
        isSubmitting.value = false;
      }
    };
    
    // Cancel and go back
    const cancel = () => {
      router.back();
    };
    
    return {
      booking,
      checkInDate,
      checkInTime,
      checkOutDate,
      checkOutTime,
      ratePerNight,
      isSubmitting,
      errorMessage,
      editMode,
      calculateAmount,
      onDocumentUpload,
      submitForm,
      cancel
    };
  }
};
</script>

<style scoped>
.booking-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-row {
  display: flex;
  margin-right: -15px;
  margin-left: -15px;
}

.col-md-6 {
  flex: 0 0 50%;
  max-width: 50%;
  padding-right: 15px;
  padding-left: 15px;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  font-weight: 500;
}
</style>
```

### 4.2 Check-In/Check-Out Component

Create a component for handling check-in and check-out operations:

```vue
<!-- frontend/src/components/apartments/CheckInOutForm.vue -->
<template>
  <div class="check-inout-form">
    <h3>{{ isCheckIn ? 'Check-In' : 'Check-Out' }} Guest</h3>
    
    <div class="booking-details">
      <h4>Booking Details</h4>
      <div class="detail-row">
        <span class="detail-label">Guest:</span>
        <span class="detail-value">{{ booking.guest_name }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Apartment:</span>
        <span class="detail-value">{{ booking.Apartment?.name }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Scheduled Check-In:</span>
        <span class="detail-value">{{ formatDateTime(booking.check_in_datetime) }}</span>
      </div>
      <div