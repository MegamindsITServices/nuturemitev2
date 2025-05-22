import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
    shortDescription: [
      {
        brand: {
          type: String,
          required: false,
        },
        category: {
          type: String,
          required: false,
        },
        itemWeight: {
          type: String,
          required: false,
        },
        dietType: {
          type: String,
          required: false,
        },
        totalItems: {
          type: Number,
          required: false,
        },
        flavor: {
          type: String,
          required: false,
        },
        packagingType: {
          type: String,
          required: false,
        },
      },
    ],

    nutritionInfo: [
      {
        protien: {
          type: String,
          required: false,
        },
        fat: {
          type: String,
          required: false,
        },
        fat: {
          type: String,
          required: false,
        },
        carbohydrates: {
          type: String,
          required: false,
        },
        iron: {
          type: String,
          required: false,
        },
        calcium: {
          type: String,
          required: false,
        },
        vitamin: {
          type: String,
          required: false,
        },
        Energy: {
          type: String,
          required: false,
        },
      },
    ],
    importantInformation: [
      {
        ingredients: {
          type: String,
          required: false,
        },
        storageTips: {
          type: String,
          required: false,
        },
      },
    ],
    productDescription: [
      {
        images: {
          type: [String],
          required: false,
        },
        videos: {
          type: [String],
          required: false,
        },
      },
    ],
    measurements: [
      {
        withoutPackaging: [
          {
            height: {
              type: String,
              required: false,
            },
            weight: {
              type: String,
              required: false,
            },
            width: {
              type: String,
              required: false,
            },
            length: {
              type: String,
              required: false,
            },
          },
        ],
        withPackaging: [
          {
            height: {
              type: String,
              required: false,
            },
            weight: {
              type: String,
              required: false,
            },
            width: {
              type: String,
              required: false,
            },
            length: {
              type: String,
              required: false,
            },
          },
        ],
      },
    ],
    manufacturer: {
      type: String,
      required: false,
    },
    marketedBy: {
      type: String,
      required: false,
    },
    keyFeatures: {
      type: String,
      required: false,
    },
    price: {
      type: Number,
      required: true,
    },
    originalPrice: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      required: false,
    },

    collection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collection",
      required: true,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    images: [String],
    videos: [String],
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
