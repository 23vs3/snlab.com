export interface Product {
  productId: string;
  name: {
    'zh-CN': string;
    'en': string;
  };
  description: {
    'zh-CN': string;
    'en': string;
  };
  tagline: {
    'zh-CN': string;
    'en': string;
  };
  price: {
    'zh-CN': string;
    'en': string;
  };
  image: string;
  features: {
    icon: string;
    title: {
      'zh-CN': string;
      'en': string;
    };
    description: {
      'zh-CN': string;
      'en': string;
    };
  }[];
  specs: {
    audio: {
      label: {
        'zh-CN': string;
        'en': string;
      };
      items: {
        name: {
          'zh-CN': string;
          'en': string;
        };
        value: {
          'zh-CN': string;
          'en': string;
        };
      }[];
    };
    physical: {
      label: {
        'zh-CN': string;
        'en': string;
      };
      items: {
        name: {
          'zh-CN': string;
          'en': string;
        };
        value: {
          'zh-CN': string;
          'en': string;
        };
      }[];
    };
  };
}

export const products: Product[] = [
  {
    productId: 'a1',
    name: {
      'zh-CN': '便携式音箱 A1',
      'en': 'Portable Speaker A1'
    },
    description: {
      'zh-CN': '轻巧随行，持久续航，全天候陪伴你的灵感。',
      'en': 'Lightweight and portable, long-lasting battery, accompanies your inspiration all day long.'
    },
    tagline: {
      'zh-CN': '聆听强劲且悦耳的音效。灵活便携设计。',
      'en': 'Experience powerful and pleasant sound. Flexible portable design.'
    },
    price: {
      'zh-CN': '来自 ¥2,980',
      'en': 'From ¥2,980'
    },
    image: 'https://picsum.photos/seed/a1-detail/800/600',
    features: [
      {
        icon: '🔋',
        title: {
          'zh-CN': '持久续航',
          'en': 'Long Battery Life'
        },
        description: {
          'zh-CN': '18小时连续播放，全天候陪伴你的音乐时光',
          'en': '18 hours of continuous playback, accompanies your music all day long'
        }
      },
      {
        icon: '🌊',
        title: {
          'zh-CN': '防水设计',
          'en': 'Waterproof Design'
        },
        description: {
          'zh-CN': 'IPX7防水等级，无惧户外环境挑战',
          'en': 'IPX7 waterproof rating, fearless of outdoor challenges'
        }
      },
      {
        icon: '📱',
        title: {
          'zh-CN': '无线充电',
          'en': 'Wireless Charging'
        },
        description: {
          'zh-CN': '内置Qi无线充电板，为设备提供便捷充电',
          'en': 'Built-in Qi wireless charging pad, providing convenient charging for devices'
        }
      }
    ],
    specs: {
      audio: {
        label: {
          'zh-CN': '音频规格',
          'en': 'Audio Specifications'
        },
        items: [
          {
            name: {
              'zh-CN': '频率响应',
              'en': 'Frequency Response'
            },
            value: {
              'zh-CN': '20Hz - 20kHz',
              'en': '20Hz - 20kHz'
            }
          },
          {
            name: {
              'zh-CN': '最大声压级',
              'en': 'Max Sound Pressure Level'
            },
            value: {
              'zh-CN': '95dB',
              'en': '95dB'
            }
          },
          {
            name: {
              'zh-CN': '驱动单元',
              'en': 'Driver Unit'
            },
            value: {
              'zh-CN': '3.5" 全频单元',
              'en': '3.5" Full Range Driver'
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
          }
        ]
      },
      physical: {
        label: {
          'zh-CN': '物理规格',
          'en': 'Physical Specifications'
        },
        items: [
          {
            name: {
              'zh-CN': '尺寸',
              'en': 'Dimensions'
            },
            value: {
              'zh-CN': '180 × 180 × 80mm',
              'en': '180 × 180 × 80mm'
            }
          },
          {
            name: {
              'zh-CN': '重量',
              'en': 'Weight'
            },
            value: {
              'zh-CN': '1.2kg',
              'en': '1.2kg'
            }
          },
          {
            name: {
              'zh-CN': '电池容量',
              'en': 'Battery Capacity'
            },
            value: {
              'zh-CN': '4400mAh',
              'en': '4400mAh'
            }
          },
          {
            name: {
              'zh-CN': '充电时间',
              'en': 'Charging Time'
            },
            value: {
              'zh-CN': '3小时',
              'en': '3 hours'
            }
          }
        ]
      }
    }
  },
  {
    productId: 'h100',
    name: {
      'zh-CN': '头戴耳机 H100',
      'en': 'Headphones H100'
    },
    description: {
      'zh-CN': '沉浸降噪，细腻还原，日常与通勤的惬意之选。',
      'en': 'Immersive noise cancellation, delicate sound reproduction, perfect for daily use and commuting.'
    },
    tagline: {
      'zh-CN': '主动降噪技术，带来纯净音质体验。',
      'en': 'Active noise cancellation technology for pure sound quality.'
    },
    price: {
      'zh-CN': '来自 ¥1,980',
      'en': 'From ¥1,980'
    },
    image: 'https://picsum.photos/seed/h100-detail/800/600',
    features: [
      {
        icon: '🎧',
        title: {
          'zh-CN': '主动降噪',
          'en': 'Active Noise Cancellation'
        },
        description: {
          'zh-CN': 'ANC技术，有效隔绝外界噪音',
          'en': 'ANC technology effectively blocks external noise'
        }
      },
      {
        icon: '🎵',
        title: {
          'zh-CN': '高保真音质',
          'en': 'Hi-Fi Sound'
        },
        description: {
          'zh-CN': '40mm驱动单元，还原细腻音质',
          'en': '40mm driver unit for delicate sound reproduction'
        }
      },
      {
        icon: '🔋',
        title: {
          'zh-CN': '长续航',
          'en': 'Long Battery'
        },
        description: {
          'zh-CN': '30小时连续播放，支持快充',
          'en': '30 hours of continuous playback with fast charging'
        }
      }
    ],
    specs: {
      audio: {
        label: {
          'zh-CN': '音频规格',
          'en': 'Audio Specifications'
        },
        items: [
          {
            name: {
              'zh-CN': '频率响应',
              'en': 'Frequency Response'
            },
            value: {
              'zh-CN': '10Hz - 40kHz',
              'en': '10Hz - 40kHz'
            }
          },
          {
            name: {
              'zh-CN': '驱动单元',
              'en': 'Driver Unit'
            },
            value: {
              'zh-CN': '40mm 动圈单元',
              'en': '40mm Dynamic Driver'
            }
          },
          {
            name: {
              'zh-CN': '降噪深度',
              'en': 'Noise Cancellation'
            },
            value: {
              'zh-CN': '-35dB',
              'en': '-35dB'
            }
          }
        ]
      },
      physical: {
        label: {
          'zh-CN': '物理规格',
          'en': 'Physical Specifications'
        },
        items: [
          {
            name: {
              'zh-CN': '重量',
              'en': 'Weight'
            },
            value: {
              'zh-CN': '280g',
              'en': '280g'
            }
          },
          {
            name: {
              'zh-CN': '电池容量',
              'en': 'Battery Capacity'
            },
            value: {
              'zh-CN': '500mAh',
              'en': '500mAh'
            }
          },
          {
            name: {
              'zh-CN': '充电时间',
              'en': 'Charging Time'
            },
            value: {
              'zh-CN': '1.5小时',
              'en': '1.5 hours'
            }
          }
        ]
      }
    }
  },
  {
    productId: 'a5',
    name: {
      'zh-CN': '多房间音响 A5',
      'en': 'Multi-Room Speaker A5'
    },
    description: {
      'zh-CN': '温润木质与金属质感，设计与听感的平衡之作。',
      'en': 'A balance of warm wood and metal texture, design and sound quality.'
    },
    tagline: {
      'zh-CN': '多房间联动，打造全屋音乐体验。',
      'en': 'Multi-room connectivity for whole-home music experience.'
    },
    price: {
      'zh-CN': '来自 ¥4,980',
      'en': 'From ¥4,980'
    },
    image: 'https://picsum.photos/seed/a5-detail/800/600',
    features: [
      {
        icon: '🏠',
        title: {
          'zh-CN': '多房间系统',
          'en': 'Multi-Room System'
        },
        description: {
          'zh-CN': '支持多个设备同时播放，打造全屋音乐',
          'en': 'Support multiple devices playing simultaneously for whole-home music'
        }
      },
      {
        icon: '🎼',
        title: {
          'zh-CN': '立体声',
          'en': 'Stereo Sound'
        },
        description: {
          'zh-CN': '双声道设计，带来沉浸式听觉体验',
          'en': 'Dual-channel design for immersive listening experience'
        }
      },
      {
        icon: '📡',
        title: {
          'zh-CN': '无线连接',
          'en': 'Wireless Connectivity'
        },
        description: {
          'zh-CN': '支持Wi-Fi、蓝牙等多种连接方式',
          'en': 'Supports Wi-Fi, Bluetooth and other connectivity options'
        }
      }
    ],
    specs: {
      audio: {
        label: {
          'zh-CN': '音频规格',
          'en': 'Audio Specifications'
        },
        items: [
          {
            name: {
              'zh-CN': '频率响应',
              'en': 'Frequency Response'
            },
            value: {
              'zh-CN': '40Hz - 20kHz',
              'en': '40Hz - 20kHz'
            }
          },
          {
            name: {
              'zh-CN': '输出功率',
              'en': 'Output Power'
            },
            value: {
              'zh-CN': '120W',
              'en': '120W'
            }
          },
          {
            name: {
              'zh-CN': '驱动单元',
              'en': 'Driver Unit'
            },
            value: {
              'zh-CN': '2 × 5.25" 低音 + 2 × 1" 高音',
              'en': '2 × 5.25" Woofer + 2 × 1" Tweeter'
            }
          }
        ]
      },
      physical: {
        label: {
          'zh-CN': '物理规格',
          'en': 'Physical Specifications'
        },
        items: [
          {
            name: {
              'zh-CN': '尺寸',
              'en': 'Dimensions'
            },
            value: {
              'zh-CN': '380 × 240 × 320mm',
              'en': '380 × 240 × 320mm'
            }
          },
          {
            name: {
              'zh-CN': '重量',
              'en': 'Weight'
            },
            value: {
              'zh-CN': '8.5kg',
              'en': '8.5kg'
            }
          },
          {
            name: {
              'zh-CN': '连接方式',
              'en': 'Connectivity'
            },
            value: {
              'zh-CN': 'Wi-Fi 6, Bluetooth 5.0, AUX',
              'en': 'Wi-Fi 6, Bluetooth 5.0, AUX'
            }
          }
        ]
      }
    }
  }
];

// 如果是在浏览器环境中，将 products 暴露到 window（供备用脚本使用）
if (typeof window !== 'undefined') {
  (window as any).products = products;
}

