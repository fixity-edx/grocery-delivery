const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: String,
    category: {
        type: String,
        enum: ['Grocery', 'Supermarket', 'Organic', 'Bakery', 'Dairy', 'Meat', 'Vegetables', 'Fruits', 'Other'],
        default: 'Grocery'
    },
    address: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    contact: {
        phone: String,
        email: String
    },
    timings: {
        open: String,
        close: String,
        daysOpen: [String]
    },
    images: [String],
    rating: {
        average: {
            type: Number,
            default: 0
        },
        count: {
            type: Number,
            default: 0
        }
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    commission: {
        type: Number,
        default: 10 // percentage
    },
    deliveryRadius: {
        type: Number,
        default: 5 // km
    },
    minOrderAmount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Store', storeSchema);
