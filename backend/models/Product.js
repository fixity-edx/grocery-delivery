const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true
    },
    category: {
        type: String,
        required: true
    },
    subCategory: String,
    brand: String,
    price: {
        type: Number,
        required: true
    },
    originalPrice: Number,
    discount: {
        type: Number,
        default: 0
    },
    unit: {
        type: String,
        required: true,
        enum: ['kg', 'g', 'l', 'ml', 'piece', 'dozen', 'pack', '1kg', '500g', '250g', '1L', '500ml', '1pc', '1dz']
    },
    quantity: {
        type: Number,
        default: 1
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    lowStockThreshold: {
        type: Number,
        default: 10
    },
    images: [String],
    tags: [String],
    isAvailable: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
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
    aiGenerated: {
        type: Boolean,
        default: false
    },
    nutritionalInfo: {
        calories: Number,
        protein: String,
        carbs: String,
        fat: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp on save
productSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Product', productSchema);
