const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const favoriteSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    dishes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Dish'     // must match with "name" on mongoose.model(name, Schema)
        }
    ]
}, {
    timestamps: true
});

var Favorites = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorites;
