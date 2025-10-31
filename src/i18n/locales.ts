export type Language = 'zh-CN' | 'en';

export interface Translations {
  nav: {
    products: string;
    support: string;
    stories: string;
  };
  sections: {
    products: {
      title: string;
      subtitle: string;
      learnMore: string;
    };
    support: {
      title: string;
      subtitle: string;
      onlineStore: string;
      productSupport: string;
      contactEmail: string;
      copy: string;
      xiaohongshu: string;
      taobao: string;
    };
    stories: {
      title: string;
      subtitle: string;
      newsletterTitle: string;
      newsletterDesc: string;
      emailPlaceholder: string;
      subscribe: string;
    };
  };
  footer: {
    policies: string;
    privacy: string;
    cookie: string;
    terms: string;
    warranty: string;
    followUs: string;
    wechat: string;
    xiaohongshu: string;
    copyright: string;
  };
  pages: {
    warranty: {
      title: string;
      subtitle: string;
    };
  };
  common: {
    scanToFollow: string;
    emailCopied: string;
    home: string;
    chinese: string;
    english: string;
  };
  products: {
    a1: {
      name: string;
      description: string;
      tagline: string;
      price: string;
      learnMore: string;
      experience: string;
      features: {
        battery: string;
        batteryDesc: string;
        waterproof: string;
        waterproofDesc: string;
        wireless: string;
        wirelessDesc: string;
      };
      specs: {
        audio: string;
        physical: string;
        frequency: string;
        spl: string;
        driver: string;
        bluetooth: string;
        dimensions: string;
        weight: string;
        battery: string;
        chargeTime: string;
      };
    };
    h100: {
      name: string;
      description: string;
    };
    a5: {
      name: string;
      description: string;
    };
  };
}

export const translations: Record<Language, Translations> = {
  'zh-CN': {
    nav: {
      products: '产品',
      support: '购买与支持',
      stories: '资讯订阅'
    },
    sections: {
      products: {
        title: '臻选产品',
        subtitle: '精致材料 · 现代声学 · 为礼赠季做好准备',
        learnMore: '了解更多'
      },
      support: {
        title: '客户服务',
        subtitle: '产品支持 · 线上购买',
        onlineStore: '线上门店',
        productSupport: '产品支持',
        contactEmail: '联系邮箱',
        copy: '复制',
        xiaohongshu: '小红书旗舰店',
        taobao: '淘宝旗舰店'
      },
      stories: {
        title: '品牌资讯',
        subtitle: '百年工艺的灵感再造，面向未来的经典表达',
        newsletterTitle: '订阅我们的邮件推送',
        newsletterDesc: '获得新品与活动资讯。',
        emailPlaceholder: '输入你的邮箱',
        subscribe: '订阅'
      }
    },
    footer: {
      policies: '政策',
      privacy: '隐私政策',
      cookie: 'Cookie',
      terms: '条款与条件',
      warranty: '保修条款',
      followUs: '关注我们',
      wechat: '微信公众号',
      xiaohongshu: '小红书',
      copyright: '© SINIAN LAB 2025'
    },
    pages: {
      warranty: {
        title: '保修条款',
        subtitle: '了解我们的产品保修政策和服务条款'
      }
    },
    common: {
      scanToFollow: '扫码关注',
      emailCopied: '邮箱已复制！',
      home: '首页',
      chinese: '中文',
      english: '英文'
    },
    products: {
      a1: {
        name: '便携式音箱 A1',
        description: '轻巧随行，持久续航，全天候陪伴你的灵感。',
        tagline: '聆听强劲且悦耳的音效。灵活便携设计。',
        price: '来自 ¥2,980',
        learnMore: '了解更多信息',
        experience: '店内体验',
        features: {
          battery: '持久续航',
          batteryDesc: '18小时连续播放，全天候陪伴你的音乐时光',
          waterproof: '防水设计',
          waterproofDesc: 'IPX7防水等级，无惧户外环境挑战',
          wireless: '无线充电',
          wirelessDesc: '内置Qi无线充电板，为设备提供便捷充电'
        },
        specs: {
          audio: '音频规格',
          physical: '物理规格',
          frequency: '频率响应',
          spl: '最大声压级',
          driver: '驱动单元',
          bluetooth: '蓝牙版本',
          dimensions: '尺寸',
          weight: '重量',
          battery: '电池容量',
          chargeTime: '充电时间'
        }
      },
      h100: {
        name: '头戴耳机 H100',
        description: '沉浸降噪，细腻还原，日常与通勤的惬意之选。'
      },
      a5: {
        name: '多房间音响 A5',
        description: '温润木质与金属质感，设计与听感的平衡之作。'
      }
    }
  },
  'en': {
    nav: {
      products: 'Products',
      support: 'Support',
      stories: 'Stories'
    },
    sections: {
      products: {
        title: 'Featured Products',
        subtitle: 'Premium Materials · Modern Acoustics · Ready for the Gift Season',
        learnMore: 'Learn More'
      },
      support: {
        title: 'Customer Service',
        subtitle: 'Product Support · Online Shopping',
        onlineStore: 'Online Store',
        productSupport: 'Product Support',
        contactEmail: 'Contact Email',
        copy: 'Copy',
        xiaohongshu: 'Xiaohongshu Store',
        taobao: 'Taobao Store'
      },
      stories: {
        title: 'Brand Stories',
        subtitle: 'Craftsmanship Reimagined, Classic Expression for the Future',
        newsletterTitle: 'Subscribe to Our Newsletter',
        newsletterDesc: 'Get the latest products and event updates.',
        emailPlaceholder: 'Enter your email',
        subscribe: 'Subscribe'
      }
    },
    footer: {
      policies: 'Policies',
      privacy: 'Privacy Policy',
      cookie: 'Cookie',
      terms: 'Terms & Conditions',
      warranty: 'Warranty Terms',
      followUs: 'Follow Us',
      wechat: 'WeChat Official Account',
      xiaohongshu: 'Xiaohongshu',
      copyright: '© SINIAN LAB 2025'
    },
    pages: {
      warranty: {
        title: 'Warranty Terms',
        subtitle: 'Learn about our product warranty policy and service terms'
      }
    },
    common: {
      scanToFollow: 'Scan to Follow',
      emailCopied: 'Email copied!',
      home: 'Home',
      chinese: 'Chinese',
      english: 'English'
    },
    products: {
      a1: {
        name: 'Portable Speaker A1',
        description: 'Lightweight and portable, long-lasting battery, accompanies your inspiration all day long.',
        tagline: 'Experience powerful and pleasant sound. Flexible portable design.',
        price: 'From ¥2,980',
        learnMore: 'Learn More',
        experience: 'Store Experience',
        features: {
          battery: 'Long Battery Life',
          batteryDesc: '18 hours of continuous playback, accompanies your music all day long',
          waterproof: 'Waterproof Design',
          waterproofDesc: 'IPX7 waterproof rating, fearless of outdoor challenges',
          wireless: 'Wireless Charging',
          wirelessDesc: 'Built-in Qi wireless charging pad, providing convenient charging for devices'
        },
        specs: {
          audio: 'Audio Specifications',
          physical: 'Physical Specifications',
          frequency: 'Frequency Response',
          spl: 'Max Sound Pressure Level',
          driver: 'Driver Unit',
          bluetooth: 'Bluetooth Version',
          dimensions: 'Dimensions',
          weight: 'Weight',
          battery: 'Battery Capacity',
          chargeTime: 'Charging Time'
        }
      },
      h100: {
        name: 'Headphones H100',
        description: 'Immersive noise cancellation, delicate sound reproduction, perfect for daily use and commuting.'
      },
      a5: {
        name: 'Multi-Room Speaker A5',
        description: 'A balance of warm wood and metal texture, design and sound quality.'
      }
    }
  }
};

