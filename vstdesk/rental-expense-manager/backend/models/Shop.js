const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

/**
 * Shop Model
 * 
 * Represents a shop rental property in the system.
 */
const Shop = sequelize.define('Shop', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  shopNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Unique identifier/number for the shop'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Name of the shop or business'
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Physical location or address of the shop'
  },
  area: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Area of the shop in square feet/meters'
  },
  rentAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Monthly rent amount for the shop'
  },
  securityDeposit: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Security deposit amount paid by the tenant'
  },
  tenantName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Name of the current tenant'
  },
  tenantContact: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Contact information of the tenant (phone/email)'
  },
  leaseStartDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Start date of the current lease agreement'
  },
  leaseEndDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'End date of the current lease agreement (if applicable)'
  },
  rentDueDay: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 31
    },
    comment: 'Day of the month when rent is due'
  },
  status: {
    type: DataTypes.ENUM('occupied', 'vacant', 'maintenance', 'reserved'),
    allowNull: false,
    defaultValue: 'occupied',
    comment: 'Current status of the shop'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Additional notes or information about the shop'
  },
  includeInWaterBill: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether this shop should be included in water bill allocations'
  },
  includeInCurrentBill: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether this shop should be included in electricity bill allocations'
  },
  waterBillShare: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0,
    comment: 'Percentage share of water bill (0-100)'
  },
  currentBillShare: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0,
    comment: 'Percentage share of electricity bill (0-100)'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    comment: 'ID of the user who created this record'
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    },
    comment: 'ID of the user who last updated this record'
  }
}, {
  tableName: 'shops',
  timestamps: true,
  indexes: [
    {
      name: 'shops_shop_number_index',
      unique: true,
      fields: ['shopNumber']
    },
    {
      name: 'shops_tenant_name_index',
      fields: ['tenantName']
    },
    {
      name: 'shops_status_index',
      fields: ['status']
    },
    {
      name: 'shops_lease_dates_index',
      fields: ['leaseStartDate', 'leaseEndDate']
    }
  ]
});

// Define associations
Shop.belongsTo(User, { 
  foreignKey: 'createdBy', 
  as: 'creator' 
});

Shop.belongsTo(User, { 
  foreignKey: 'updatedBy', 
  as: 'updater' 
});

module.exports = Shop;