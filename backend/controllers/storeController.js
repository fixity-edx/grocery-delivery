const Store = require('../models/Store');
const Product = require('../models/Product');

// @desc    Get all stores
// @route   GET /api/stores
// @access  Public
exports.getAllStores = async (req, res) => {
    try {
        const { category, search, isApproved } = req.query;

        const query = { isActive: true };

        // Handle approval filter
        // If isApproved is 'all', we don't add it to the query
        // If not specified, default to showing only approved stores
        if (isApproved === 'false') {
            query.isApproved = false;
        } else if (isApproved !== 'all') {
            query.isApproved = true;
        }

        if (category) query.category = category;
        if (search) query.name = { $regex: search, $options: 'i' };

        const stores = await Store.find(query)
            .populate('owner', 'name email phone')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: stores, count: stores.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single store
// @route   GET /api/stores/:id
// @access  Public
exports.getStore = async (req, res) => {
    try {
        const store = await Store.findById(req.params.id).populate('owner', 'name email phone');

        if (!store) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }

        // Get product count
        const productCount = await Product.countDocuments({ store: store._id, isAvailable: true });

        res.json({ success: true, data: { ...store.toObject(), productCount } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create store (Vendor only)
// @route   POST /api/stores
// @access  Private (Vendor)
exports.createStore = async (req, res) => {
    try {
        const storeData = {
            ...req.body,
            owner: req.user._id,
            isApproved: process.env.NODE_ENV === 'development' // Auto-approve in dev
        };

        const store = await Store.create(storeData);

        res.status(201).json({ success: true, data: store });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update store (Vendor only)
// @route   PUT /api/stores/:id
// @access  Private (Vendor)
exports.updateStore = async (req, res) => {
    try {
        const store = await Store.findById(req.params.id);

        if (!store) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }

        // Verify ownership
        if (store.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const updatedStore = await Store.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json({ success: true, data: updatedStore });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete store (Vendor only)
// @route   DELETE /api/stores/:id
// @access  Private (Vendor)
exports.deleteStore = async (req, res) => {
    try {
        const store = await Store.findById(req.params.id);

        if (!store) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }

        // Verify ownership
        if (store.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await store.deleteOne();

        res.json({ success: true, message: 'Store deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get vendor's stores
// @route   GET /api/stores/my-stores
// @access  Private (Vendor)
exports.getMyStores = async (req, res) => {
    try {
        const stores = await Store.find({ owner: req.user._id });

        res.json({ success: true, data: stores, count: stores.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get nearby stores
// @route   GET /api/stores/nearby
// @access  Public
exports.getNearbyStores = async (req, res) => {
    try {
        const { lat, lng, radius = 5 } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ success: false, message: 'Latitude and longitude required' });
        }

        // Simple distance calculation (can be improved with MongoDB geospatial queries)
        const stores = await Store.find({ isActive: true, isApproved: true });

        const nearbyStores = stores.filter(store => {
            if (!store.address?.coordinates) return false;

            const distance = calculateDistance(
                parseFloat(lat),
                parseFloat(lng),
                store.address.coordinates.lat,
                store.address.coordinates.lng
            );

            return distance <= radius;
        });

        res.json({ success: true, data: nearbyStores, count: nearbyStores.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Helper function to calculate distance
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

module.exports = exports;
