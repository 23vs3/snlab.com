// export interface Product {
//   productId: string;
//   name: {
//     'zh-CN': string;
//     'en': string;
//   };
//   description: {
//     'zh-CN': string;
//     'en': string;
//   };
//   tagline: {
//     'zh-CN': string;
//     'en': string;
//   };
//   price: {
//     'zh-CN': string;
//     'en': string;
//   };
//   image: string;
//   features: {
//     icon: string;
//     title: {
//       'zh-CN': string;
//       'en': string;
//     };
//     description: {
//       'zh-CN': string;
//       'en': string;
//     };
//   }[];
//   specs: {
//     audio: {
//       label: {
//         'zh-CN': string;
//         'en': string;
//       };
//       items: {
//         name: {
//           'zh-CN': string;
//           'en': string;
//         };
//         value: {
//           'zh-CN': string;
//           'en': string;
//         };
//       }[];
//     };
//     physical: {
//       label: {
//         'zh-CN': string;
//         'en': string;
//       };
//       items: {
//         name: {
//           'zh-CN': string;
//           'en': string;
//         };
//         value: {
//           'zh-CN': string;
//           'en': string;
//         };
//       }[];
//     };
//   };
// }


import { Product } from "@/types";

// export const products: Product[] = [
//   {
//     productId: 'a1',
//     name: {
//       'zh-CN': '便携式音箱 A1',
//       'en': 'Portable Speaker A1'
//     },
//     description: {
//       'zh-CN': '轻巧随行，持久续航，全天候陪伴你的灵感。',
//       'en': 'Lightweight and portable, long-lasting battery, accompanies your inspiration all day long.'
//     },
//     tagline: {
//       'zh-CN': '聆听强劲且悦耳的音效。灵活便携设计。',
//       'en': 'Experience powerful and pleasant sound. Flexible portable design.'
//     },
//     price: {
//       'zh-CN': '来自 ¥2,980',
//       'en': 'From ¥2,980'
//     },
//     image: 'https://picsum.photos/seed/a1-detail/800/600',
//     features: [
//       {
//         icon: '🔋',
//         title: {
//           'zh-CN': '持久续航',
//           'en': 'Long Battery Life'
//         },
//         description: {
//           'zh-CN': '18小时连续播放，全天候陪伴你的音乐时光',
//           'en': '18 hours of continuous playback, accompanies your music all day long'
//         }
//       },
//       {
//         icon: '🌊',
//         title: {
//           'zh-CN': '防水设计',
//           'en': 'Waterproof Design'
//         },
//         description: {
//           'zh-CN': 'IPX7防水等级，无惧户外环境挑战',
//           'en': 'IPX7 waterproof rating, fearless of outdoor challenges'
//         }
//       },
//       {
//         icon: '📱',
//         title: {
//           'zh-CN': '无线充电',
//           'en': 'Wireless Charging'
//         },
//         description: {
//           'zh-CN': '内置Qi无线充电板，为设备提供便捷充电',
//           'en': 'Built-in Qi wireless charging pad, providing convenient charging for devices'
//         }
//       }
//     ],
//     specs: {
//       audio: {
//         label: {
//           'zh-CN': '音频规格',
//           'en': 'Audio Specifications'
//         },
//         items: [
//           {
//             name: {
//               'zh-CN': '频率响应',
//               'en': 'Frequency Response'
//             },
//             value: {
//               'zh-CN': '20Hz - 20kHz',
//               'en': '20Hz - 20kHz'
//             }
//           },
//           {
//             name: {
//               'zh-CN': '最大声压级',
//               'en': 'Max Sound Pressure Level'
//             },
//             value: {
//               'zh-CN': '95dB',
//               'en': '95dB'
//             }
//           },
//           {
//             name: {
//               'zh-CN': '驱动单元',
//               'en': 'Driver Unit'
//             },
//             value: {
//               'zh-CN': '3.5" 全频单元',
//               'en': '3.5" Full Range Driver'
//             }
//           },
//           {
//             name: {
//               'zh-CN': '蓝牙版本',
//               'en': 'Bluetooth Version'
//             },
//             value: {
//               'zh-CN': '5.0',
//               'en': '5.0'
//             }
//           }
//         ]
//       },
//       physical: {
//         label: {
//           'zh-CN': '物理规格',
//           'en': 'Physical Specifications'
//         },
//         items: [
//           {
//             name: {
//               'zh-CN': '尺寸',
//               'en': 'Dimensions'
//             },
//             value: {
//               'zh-CN': '180 × 180 × 80mm',
//               'en': '180 × 180 × 80mm'
//             }
//           },
//           {
//             name: {
//               'zh-CN': '重量',
//               'en': 'Weight'
//             },
//             value: {
//               'zh-CN': '1.2kg',
//               'en': '1.2kg'
//             }
//           },
//           {
//             name: {
//               'zh-CN': '电池容量',
//               'en': 'Battery Capacity'
//             },
//             value: {
//               'zh-CN': '4400mAh',
//               'en': '4400mAh'
//             }
//           },
//           {
//             name: {
//               'zh-CN': '充电时间',
//               'en': 'Charging Time'
//             },
//             value: {
//               'zh-CN': '3小时',
//               'en': '3 hours'
//             }
//           }
//         ]
//       }
//     }
//   },
//   // {
//   //   productId: 'h100',
//   //   name: {
//   //     'zh-CN': '头戴耳机 H100',
//   //     'en': 'Headphones H100'
//   //   },
//   //   description: {
//   //     'zh-CN': '沉浸降噪，细腻还原，日常与通勤的惬意之选。',
//   //     'en': 'Immersive noise cancellation, delicate sound reproduction, perfect for daily use and commuting.'
//   //   },
//   //   tagline: {
//   //     'zh-CN': '主动降噪技术，带来纯净音质体验。',
//   //     'en': 'Active noise cancellation technology for pure sound quality.'
//   //   },
//   //   price: {
//   //     'zh-CN': '来自 ¥1,980',
//   //     'en': 'From ¥1,980'
//   //   },
//   //   image: 'https://picsum.photos/seed/h100-detail/800/600',
//   //   features: [
//   //     {
//   //       icon: '🎧',
//   //       title: {
//   //         'zh-CN': '主动降噪',
//   //         'en': 'Active Noise Cancellation'
//   //       },
//   //       description: {
//   //         'zh-CN': 'ANC技术，有效隔绝外界噪音',
//   //         'en': 'ANC technology effectively blocks external noise'
//   //       }
//   //     },
//   //     {
//   //       icon: '🎵',
//   //       title: {
//   //         'zh-CN': '高保真音质',
//   //         'en': 'Hi-Fi Sound'
//   //       },
//   //       description: {
//   //         'zh-CN': '40mm驱动单元，还原细腻音质',
//   //         'en': '40mm driver unit for delicate sound reproduction'
//   //       }
//   //     },
//   //     {
//   //       icon: '🔋',
//   //       title: {
//   //         'zh-CN': '长续航',
//   //         'en': 'Long Battery'
//   //       },
//   //       description: {
//   //         'zh-CN': '30小时连续播放，支持快充',
//   //         'en': '30 hours of continuous playback with fast charging'
//   //       }
//   //     }
//   //   ],
//   //   specs: {
//   //     audio: {
//   //       label: {
//   //         'zh-CN': '音频规格',
//   //         'en': 'Audio Specifications'
//   //       },
//   //       items: [
//   //         {
//   //           name: {
//   //             'zh-CN': '频率响应',
//   //             'en': 'Frequency Response'
//   //           },
//   //           value: {
//   //             'zh-CN': '10Hz - 40kHz',
//   //             'en': '10Hz - 40kHz'
//   //           }
//   //         },
//   //         {
//   //           name: {
//   //             'zh-CN': '驱动单元',
//   //             'en': 'Driver Unit'
//   //           },
//   //           value: {
//   //             'zh-CN': '40mm 动圈单元',
//   //             'en': '40mm Dynamic Driver'
//   //           }
//   //         },
//   //         {
//   //           name: {
//   //             'zh-CN': '降噪深度',
//   //             'en': 'Noise Cancellation'
//   //           },
//   //           value: {
//   //             'zh-CN': '-35dB',
//   //             'en': '-35dB'
//   //           }
//   //         }
//   //       ]
//   //     },
//   //     physical: {
//   //       label: {
//   //         'zh-CN': '物理规格',
//   //         'en': 'Physical Specifications'
//   //       },
//   //       items: [
//   //         {
//   //           name: {
//   //             'zh-CN': '重量',
//   //             'en': 'Weight'
//   //           },
//   //           value: {
//   //             'zh-CN': '280g',
//   //             'en': '280g'
//   //           }
//   //         },
//   //         {
//   //           name: {
//   //             'zh-CN': '电池容量',
//   //             'en': 'Battery Capacity'
//   //           },
//   //           value: {
//   //             'zh-CN': '500mAh',
//   //             'en': '500mAh'
//   //           }
//   //         },
//   //         {
//   //           name: {
//   //             'zh-CN': '充电时间',
//   //             'en': 'Charging Time'
//   //           },
//   //           value: {
//   //             'zh-CN': '1.5小时',
//   //             'en': '1.5 hours'
//   //           }
//   //         }
//   //       ]
//   //     }
//   //   }
//   // },
//   // {
//   //   productId: 'a5',
//   //   name: {
//   //     'zh-CN': '多房间音响 A5',
//   //     'en': 'Multi-Room Speaker A5'
//   //   },
//   //   description: {
//   //     'zh-CN': '温润木质与金属质感，设计与听感的平衡之作。',
//   //     'en': 'A balance of warm wood and metal texture, design and sound quality.'
//   //   },
//   //   tagline: {
//   //     'zh-CN': '多房间联动，打造全屋音乐体验。',
//   //     'en': 'Multi-room connectivity for whole-home music experience.'
//   //   },
//   //   price: {
//   //     'zh-CN': '来自 ¥4,980',
//   //     'en': 'From ¥4,980'
//   //   },
//   //   image: 'https://picsum.photos/seed/a5-detail/800/600',
//   //   features: [
//   //     {
//   //       icon: '🏠',
//   //       title: {
//   //         'zh-CN': '多房间系统',
//   //         'en': 'Multi-Room System'
//   //       },
//   //       description: {
//   //         'zh-CN': '支持多个设备同时播放，打造全屋音乐',
//   //         'en': 'Support multiple devices playing simultaneously for whole-home music'
//   //       }
//   //     },
//   //     {
//   //       icon: '🎼',
//   //       title: {
//   //         'zh-CN': '立体声',
//   //         'en': 'Stereo Sound'
//   //       },
//   //       description: {
//   //         'zh-CN': '双声道设计，带来沉浸式听觉体验',
//   //         'en': 'Dual-channel design for immersive listening experience'
//   //       }
//   //     },
//   //     {
//   //       icon: '📡',
//   //       title: {
//   //         'zh-CN': '无线连接',
//   //         'en': 'Wireless Connectivity'
//   //       },
//   //       description: {
//   //         'zh-CN': '支持Wi-Fi、蓝牙等多种连接方式',
//   //         'en': 'Supports Wi-Fi, Bluetooth and other connectivity options'
//   //       }
//   //     }
//   //   ],
//   //   specs: {
//   //     audio: {
//   //       label: {
//   //         'zh-CN': '音频规格',
//   //         'en': 'Audio Specifications'
//   //       },
//   //       items: [
//   //         {
//   //           name: {
//   //             'zh-CN': '频率响应',
//   //             'en': 'Frequency Response'
//   //           },
//   //           value: {
//   //             'zh-CN': '40Hz - 20kHz',
//   //             'en': '40Hz - 20kHz'
//   //           }
//   //         },
//   //         {
//   //           name: {
//   //             'zh-CN': '输出功率',
//   //             'en': 'Output Power'
//   //           },
//   //           value: {
//   //             'zh-CN': '120W',
//   //             'en': '120W'
//   //           }
//   //         },
//   //         {
//   //           name: {
//   //             'zh-CN': '驱动单元',
//   //             'en': 'Driver Unit'
//   //           },
//   //           value: {
//   //             'zh-CN': '2 × 5.25" 低音 + 2 × 1" 高音',
//   //             'en': '2 × 5.25" Woofer + 2 × 1" Tweeter'
//   //           }
//   //         }
//   //       ]
//   //     },
//   //     physical: {
//   //       label: {
//   //         'zh-CN': '物理规格',
//   //         'en': 'Physical Specifications'
//   //       },
//   //       items: [
//   //         {
//   //           name: {
//   //             'zh-CN': '尺寸',
//   //             'en': 'Dimensions'
//   //           },
//   //           value: {
//   //             'zh-CN': '380 × 240 × 320mm',
//   //             'en': '380 × 240 × 320mm'
//   //           }
//   //         },
//   //         {
//   //           name: {
//   //             'zh-CN': '重量',
//   //             'en': 'Weight'
//   //           },
//   //           value: {
//   //             'zh-CN': '8.5kg',
//   //             'en': '8.5kg'
//   //           }
//   //         },
//   //         {
//   //           name: {
//   //             'zh-CN': '连接方式',
//   //             'en': 'Connectivity'
//   //           },
//   //           value: {
//   //             'zh-CN': 'Wi-Fi 6, Bluetooth 5.0, AUX',
//   //             'en': 'Wi-Fi 6, Bluetooth 5.0, AUX'
//   //           }
//   //         }
//   //       ]
//   //     }
//   //   }
//   // }
// ];


// new plan！！！！！！！！！！！


// 产品数据
export const products: Product[] = [
  {
    productId: 'snilab-s',
    productCode: 'snilab-s-2025',
    name: {
      'zh-CN': '无线蓝牙音箱 SNILAB-S',
      'en': 'Wireless Bluetooth Speaker SNILAB-S'
    },
    description: {
      'zh-CN': '专业级无线蓝牙音箱，360°环绕声，约20小时超长续航。采用先进的音频技术，提供卓越的音质体验。IPX4防水设计，户外露营必备。',
      'en': 'Professional-grade wireless Bluetooth speaker with 360° surround sound and 20 hours long battery life. Advanced audio technology delivers exceptional sound quality. IPX4 waterproof design, essential for outdoor camping.'
    },
    shortDescription: {
      'zh-CN': '高清音质，超长续航，防水设计',
      'en': 'HD Sound, Long Battery Life, Waterproof Design'
    },
    tagline: {
      'zh-CN': '重新定义便携音乐体验',
      'en': 'Redefine portable music experience'
    },
    category: 'electronics/audio/speakers',
    brand: 'SNILAB',
    
    basePrice: 599,
    compareAtPrice: 599,
    priceDisplay: {
      'zh-CN': '¥599',
      'en': '¥599'
    },
    
    mainImage: '/images/product_mainImage.png',
    defaultImages: [
      '/images/product_defaultImage1.png',
      '/images/product_defaultImage2.png',
      '/images/product_defaultImage3.png',
      '/images/product_defaultImage4.png'
    ],
    longImages: [
      '/images/product_longImage1.png',
      '/images/product_longImage2.png',
      '/images/product_longImage3.png',
      '/images/product_longImage4.png'
    ],
    videos: [
      '/images/product_video1.mp4',
    ],
    
    // 属性定义
    attributes: [
      {
        attribute: {
          attributeId: 'color',
          attributeName: {  
            'zh-CN': '颜色',
            'en': 'Color'
          },
          type: 'color',
          isRequired: true,
          displayOrder: 1,
          helpText: {
            'zh-CN': '选择您喜欢的颜色',
            'en': 'Select your favorite color'
          }
        },
        options: [
          {
            optionId: 'orange',
            optionName: {
              'zh-CN': '橙橘',
              'en': 'Orange'
            },
            value: '#FFA500',
            previewImage: '/images/product_colorOrangePreImage.png',
            description: {
              'zh-CN': '橙橘色，展现热情与动感',
              'en': 'Orange, showing passion and energy'
            },
            priceAdjustment: 0,
            inStock: true,
            stockCount: 100,
            displayOrder: 1
          },
          // ... 其他颜色选项
          {
            optionId: 'black',
            optionName: {
              'zh-CN': '暗黑',
              'en': 'Black'
            },
            value: '#000000',
            previewImage: '/images/product_colorBlackPreImage.png',
            description: {
              'zh-CN': '暗黑，展现神秘与稳重',
              'en': 'Black, showing mystery and steady'
            },
            priceAdjustment: 0,
            inStock: true,
            stockCount: 100,
            displayOrder: 2
          },
          {
            optionId: 'white',
            optionName: {
              'zh-CN': '奶白',
              'en': 'Milk White'
            },
            value: '#FFFFFF',
            previewImage: '/images/product_colorWhitePreImage.png',
            description: {
              'zh-CN': '奶白，展现纯洁与清新',
              'en': 'Milk White, showing pure and fresh'
            },
            priceAdjustment: 0,
            inStock: true,
            stockCount: 100,
            displayOrder: 3
          },
          {
            optionId: 'lake-blue',
            optionName: {
              'zh-CN': '湖蓝',
              'en': 'Lake Blue'
            },
            value: '#007BFF',
            previewImage: '/images/product_colorBluePreImage.png',
            description: {
              'zh-CN': '湖蓝，展现清新与宁静',
              'en': 'Lake Blue, showing fresh and calm'
            },
            priceAdjustment: 0,
            inStock: true,
            stockCount: 100,
            displayOrder: 4
          },
        ],
        selectedOptionId: 'orange'
      },
      // ... 其他属性
    ],
    
    // SKU列表
    skus: [
      {
        skuId: 'SNILAB-S-ORANGE',
        skuCode: 'SNILAB-S-ORANGE-2025',
        attributes: {
          color: 'orange',
          // memory: '16gb',
          // warranty: 'standard'
        },
        price: 599,
        stockCount: 100,
        images: [
          '/images/product_skuOrangeImage1.png',
          '/images/product_skuOrangeImage2.png',
          '/images/product_skuOrangeImage3.png',
          '/images/product_skuOrangeImage4.png'
        ],
        isDefault: true,
        isActive: true,
        metadata: {
          weight: 650,
          weightUnit: 'g',
          dimensions: {
            length: 127,
            width: 127,
            height: 50,
            unit: 'mm'
          },
          barcode: '123456789012',// 条形码
          manufacturerSku: 'TF-SNILAB-S-ORANGE-2025'// 制造商SKU
        }
      },
      // ... 其他SKU
      {
        skuId: 'SNILAB-S-BLACK',
        skuCode: 'SNILAB-S-BLACK-2025',
        attributes: {
          color: 'black',
          // memory: '16gb',
          // warranty: 'standard'
        },
        price: 599,
        stockCount: 100,
        images: [
          '/images/product_skuBlackImage1.png',
          '/images/product_skuBlackImage2.png',
          '/images/product_skuBlackImage3.png',
          '/images/product_skuBlackImage4.png'
        ],
        isDefault: true,
        isActive: true,
        metadata: {
          weight: 650,
          weightUnit: 'g',
          dimensions: {
            length: 127,
            width: 127,
            height: 50,
            unit: 'mm'
          },
          barcode: '123456789012',// 条形码
          manufacturerSku: 'TF-SNILAB-S-BLACK-2025'// 制造商SKU
        }
      },
      {
        skuId: 'SNILAB-S-WHITE',
        skuCode: 'SNILAB-S-WHITE-2025',
        attributes: {
          color: 'white',
          // memory: '16gb',
          // warranty: 'standard'
        },
        price: 599,
        stockCount: 100,
        images: [
          '/images/product_skuWhiteImage1.png',
          '/images/product_skuWhiteImage2.png',
          '/images/product_skuWhiteImage3.png',
          '/images/product_skuWhiteImage4.png'
        ],
        isDefault: true,
        isActive: true,
        metadata: {
          weight: 650,
          weightUnit: 'g',
          dimensions: {
            length: 127,
            width: 127,
            height: 50,
            unit: 'mm'
          },
          barcode: '123456789012',// 条形码
          manufacturerSku: 'TF-SNILAB-S-WHITE-2025'// 制造商SKU
        }
      },
      {
        skuId: 'SNILAB-S-LAKE-BLUE',
        skuCode: 'SNILAB-S-LAKE-BLUE-2025',
        attributes: {
          color: 'lake-blue',
          // memory: '16gb',
          // warranty: 'standard'
        },
        price: 599,
        stockCount: 100,
        images: [
          '/images/product_skuBlueImage1.png',
          '/images/product_skuBlueImage2.png',
          '/images/product_skuBlueImage3.png',
          '/images/product_skuBlueImage4.png'
        ],
        isDefault: true,
        isActive: true,
        metadata: {
          weight: 650,
          weightUnit: 'g',
          dimensions: {
            length: 127,
            width: 127,
            height: 50,
            unit: 'mm'
          },
          barcode: '123456789012',// 条形码
          manufacturerSku: 'TF-SNILAB-S-LAKE-BLUE-2025'// 制造商SKU
        }
      },
    ],
    
    defaultSkuId: 'SNILAB-S-ORANGE',
    
    // 产品特性
    features: [
      {
        icon: '🔋',
        title: {
          'zh-CN': '持久续航',
          'en': 'Long Battery Life'
        },
        description: {
          'zh-CN': '最多20小时连续播放，全天候陪伴你的音乐时光',
          'en': 'Up to 20 hours of continuous playback, accompanies your music all day long'
        },
        order: 1
      },
      // ... 其他特性
      {
        icon: '🌊',
        title: {
          'zh-CN': '防水设计',
          'en': 'Waterproof Design'
        },
        description: {
          'zh-CN': 'IPX6防水等级，无惧户外环境挑战',
          'en': 'IPX6 waterproof rating, fearless of outdoor challenges'
        },
        order: 1
      },
    ],
    
    // 产品规格
    specs: {
      // audio: {
      //   label: {
      //     'zh-CN': '音频规格',
      //     'en': 'Audio Specifications'
      //   },
      //   items: [
      //     {
      //       name: {
      //         'zh-CN': '频率响应',
      //         'en': 'Frequency Response'
      //       },
      //       value: {
      //         'zh-CN': '20Hz - 20kHz',
      //         'en': '20Hz - 20kHz'
      //       },
      //       unit: 'Hz',
      //       order: 1
      //     },
      //     // ... 其他规格
      //   ]
      // },
      // ... 其他规格类别
      // physical: {
      //   label: {
      //     'zh-CN': '物理规格',
      //     'en': 'Physical Specifications'
      //   },
      //   items: [
      //     {
      //       name: {
      //         'zh-CN': '尺寸',
      //         'en': 'Dimensions'
      //       },
      //       value: {
      //         'zh-CN': '180 × 180 × 80mm',
      //         'en': '180 × 180 × 80mm'
      //       }
      //     },
      //     {
      //       name: {
      //         'zh-CN': '重量',
      //         'en': 'Weight'
      //       },
      //       value: {
      //         'zh-CN': '1.2kg',
      //         'en': '1.2kg'
      //       }
      //     },
      //     {
      //       name: {
      //         'zh-CN': '电池容量',
      //         'en': 'Battery Capacity'
      //       },
      //       value: {
      //         'zh-CN': '4400mAh',
      //         'en': '4400mAh'
      //       }
      //     },
      //     {
      //       name: {
      //         'zh-CN': '充电时间',
      //         'en': 'Charging Time'
      //       },
      //       value: {
      //         'zh-CN': '3小时',
      //         'en': '3 hours'
      //       }
      //     }
      //   ]
      // },
      specifications: {
        label: {
          'zh-CN': '规格参数',
          'en': 'Specifications Parameters'
        },
        items: [
          {
            name: {
              'zh-CN': '型号',
              'en': 'Model'
            },
            value: {
              'zh-CN': 'SNILAB-S',
              'en': 'SNILAB-S'
            }
          },
          {
            name: {
              'zh-CN': '基本规格',
              'en': 'Basic Specifications'
            },
            value: {
              'zh-CN': '橙橘色，暗黑色，奶白色，湖蓝色',
              'en': 'Orange, Black, Milk White, Lake Blue'
            }
          },
          {
            name: {
              'zh-CN': '蓝牙版本',
              'en': 'Bluetooth Version'
            },
            value: {
              'zh-CN': '5.0',
              'en': '5.0'
            }
          },
          {
            name: {
              'zh-CN': '喇叭单元',
              'en': 'Speaker Unit'
            },
            value: {
              'zh-CN': '双喇叭',
              'en': 'Dual Speakers'
            }
          },{
            name: {
              'zh-CN': '音频接口',
              'en': 'Audio Interface'
            },
            value: {
              'zh-CN': 'AUX音频输入',
              'en': 'AUX Audio Input'
            }
          },
          {
            name: {
              'zh-CN': '充电接口',
              'en': 'Charging Interface'
            },
            value: {
              'zh-CN': 'USB type C',
              'en': 'USB type C'
            }
          },
          {
            name: {
              'zh-CN': '电池类型',
              'en': 'Battery Type'
            },
            value: {
              'zh-CN': '锂电池',
              'en': 'Li-ion Battery'
            }
          },
          
          {
            name: {
              'zh-CN': '电池容量',
              'en': 'Battery Capacity'
            },
            value: {
              'zh-CN': '2900mAh',
              'en': '2900mAh'
            }
          },
          {
            name: {
              'zh-CN': '电池续航',
              'en': 'Battery Duration'
            },
            value: {
              'zh-CN': '约20小时',
              'en': 'About 20 hours'
            }
          },
          {
            name: {
              'zh-CN': '防水等级',
              'en': 'Waterproof Rating'
            },
            value: {
              'zh-CN': 'IPX4',
              'en': 'IPX4'
            }
          },
          {
            name: {
              'zh-CN': '操控方式',
              'en': 'Operating Mode'
            },
            value: {
              'zh-CN': '实体按键',
              'en': 'Physical Buttons'
            }
          },
          {
            name: {
              'zh-CN': '外壳材质',
              'en': 'Shell Material'
            },
            value: {
              'zh-CN': 'ABS塑料',
              'en': 'ABS Plastic'
            }
          },
          {
            name: {
              'zh-CN': '尺寸',
              'en': 'Dimensions'
            },
            value: {
              'zh-CN': '127mm × 127mm × 50mm',
              'en': '127mm × 127mm × 50mm'
            }
          },
          {
            name: {
              'zh-CN': '重量',
              'en': 'Weight'
            },
            value: {
              'zh-CN': '650g',
              'en': '650g'
            }
          },
          {
            name: {
              'zh-CN': '包装清单',
              'en': 'Packing List'
            },
            value: {
              'zh-CN': '音箱 x 1，充电线 x 1，说明书 x 1',
              'en': 'Speaker x 1, Charging Cable x 1, User Manual x 1'
            }
          },
          {
            name: {
              'zh-CN': '上市时间',
              'en': 'Release Date'
            },
            value: {
              'zh-CN': '2025年12月',
              'en': 'December 2025'
            }
          },
          {
            name: {
              'zh-CN': '保修期限',
              'en': 'Warranty Period'
            },
            value: {
              'zh-CN': '1年',
              'en': '1 year'
            }
          },
        ]
      },
    },
    
    // 营销信息
    tags: ['无线', '蓝牙', '便携', '音箱', '防水', '户外'],
    badges: [
      {
        text: '新品',
        type: 'new',
        color: '#10B981'
      }
    ],
    
    // 元数据
    status: 'active',
    isFeatured: true,
    isInStock: true,
    createdAt: new Date('2025-12-26'),
    updatedAt: new Date('2026-01-23'),
    salesCount: 158,
    viewCount: 6107
  },
  // ... 更多产品
];

// 导出数据
export default products;

// 如果是在浏览器环境中，将 products 暴露到 window（供备用脚本使用）
if (typeof window !== 'undefined') {
  (window as any).products = products;
}