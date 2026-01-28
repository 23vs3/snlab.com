import { products } from '../config/products-data.ts';
import type { Product } from '@/types';

export type Language = 'zh-CN' | 'en';

/**
 * 根据产品数据动态生成产品翻译对象
 */
function generateProductTranslations(products: Product[], lang: Language): Record<string, any> {
  const productTranslations: Record<string, any> = {};
  
  products.forEach(product => {
    const productTranslation: any = {
      name: product.name[lang] || product.name['zh-CN'] || '',
      description: product.description?.[lang] || product.description?.['zh-CN'] || '',
    };
    
    // 添加 tagline（如果有）
    if (product.tagline) {
      productTranslation.tagline = product.tagline[lang] || product.tagline['zh-CN'] || '';
    }
    
    // 添加价格显示（如果有）
    if (product.priceDisplay) {
      productTranslation.price = product.priceDisplay[lang] || product.priceDisplay['zh-CN'] || '';
    }
    
    // 添加通用翻译文本
    productTranslation.learnMore = lang === 'zh-CN' ? '了解更多信息' : 'Learn More';
    productTranslation.experience = lang === 'zh-CN' ? '店内体验' : 'Store Experience';
    
    // 添加特性翻译（features）- 根据实际数据结构处理
    if (product.features && product.features.length > 0) {
      productTranslation.features = {};
      product.features.forEach((feature, index) => {
        // 使用特性的标题作为键名（转换为小写并移除空格）
        const featureKey = feature.title?.['zh-CN']?.toLowerCase().replace(/\s+/g, '') || `feature${index}`;
        productTranslation.features[featureKey] = feature.title?.[lang] || feature.title?.['zh-CN'] || '';
        productTranslation.features[`${featureKey}Desc`] = feature.description?.[lang] || feature.description?.['zh-CN'] || '';
      });
    }
    
    // 添加规格翻译（specs）- 根据实际数据结构处理
    if (product.specs) {
      productTranslation.specs = {};
      Object.keys(product.specs).forEach(specCategory => {
        const specCategoryData = product.specs![specCategory];
        // 添加规格类别标签
        if (specCategoryData.label) {
          productTranslation.specs[specCategory] = specCategoryData.label[lang] || specCategoryData.label['zh-CN'] || '';
        }
        
        // 添加规格项（根据实际结构，items 中的 name 字段）
        if (specCategoryData.items && Array.isArray(specCategoryData.items)) {
          specCategoryData.items.forEach((item) => {
            if (item.name) {
              // 使用规格项的名称作为键名（转换为小写并移除空格）
              const itemKey = item.name['zh-CN']?.toLowerCase().replace(/\s+/g, '') || 
                            item.name[lang]?.toLowerCase().replace(/\s+/g, '') || '';
              if (itemKey) {
                productTranslation.specs[itemKey] = item.name[lang] || item.name['zh-CN'] || '';
              }
            }
          });
        }
      });
    }
    
    productTranslations[product.productId] = productTranslation;
  });
  
  return productTranslations;
}

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
  products: Record<string, any>; // 改为动态类型，支持任意产品ID
}

// 生成基础翻译对象
const baseTranslations = {
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
      copyright: '© SNILAB 2025'
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
      copyright: '© SNILAB 2025'
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
    }
  }
};

// 动态生成包含产品翻译的完整翻译对象
export const translations: Record<Language, Translations> = {
  'zh-CN': {
    ...baseTranslations['zh-CN'],
    products: generateProductTranslations(products, 'zh-CN')
  },
  'en': {
    ...baseTranslations['en'],
    products: generateProductTranslations(products, 'en')
  }
};