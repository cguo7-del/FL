const { createClient } = require('@supabase/supabase-js');

// 配置信息
const supabaseUrl = 'https://crnfwlpcxrnqfgwqnmun.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNybmZ3bHBjeHJucWZnd3FubXVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE1MDMwNCwiZXhwIjoyMDcwNzI2MzA0fQ.mMCVXnY4JaeUZcUAcXPnHox3rqtM_eO18dx6aW1xFII';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🚀 开始创建book_library表和插入数据');
console.log('=' .repeat(50));

// 四大方略经纬的书籍数据
const bookData = [
  // 政治方略
  {
    book_name: '政治方略经典',
    strategy_category: '政治方略',
    chapters: [
      {
        chapter_name: '第一章：政治智慧的源泉',
        chapter_content: '政治智慧源于对人性的深刻理解和对历史规律的准确把握。古代圣贤通过观察社会现象，总结出治国理政的基本原则。政治方略不仅是权力的运用，更是智慧的体现。在复杂的政治环境中，领导者需要具备敏锐的洞察力和果断的决策能力。'
      },
      {
        chapter_name: '第二章：权力与责任的平衡',
        chapter_content: '权力意味着责任，责任要求智慧。政治领导者必须在权力的行使中体现对人民的责任感。历史上成功的政治家都懂得权力的边界，明白权力的目的是为了更好地服务人民。权力与责任的平衡是政治方略的核心要义。'
      }
    ]
  },
  {
    book_name: '现代政治治理',
    strategy_category: '政治方略',
    chapters: [
      {
        chapter_name: '第一章：民主治理的现代实践',
        chapter_content: '现代民主治理强调透明度、参与性和责任制。政府决策过程需要公开透明，让民众了解政策制定的依据和过程。公民参与是民主治理的重要组成部分，通过各种渠道收集民意，确保政策符合人民利益。'
      },
      {
        chapter_name: '第二章：政策执行的艺术',
        chapter_content: '政策制定只是第一步，政策执行才是关键。有效的政策执行需要完善的制度保障、充足的资源配置和高效的执行团队。政策执行过程中要注重反馈机制，及时调整和完善政策内容。'
      }
    ]
  },
  
  // 经济方略
  {
    book_name: '经济方略要义',
    strategy_category: '经济方略',
    chapters: [
      {
        chapter_name: '第一章：市场经济的基本原理',
        chapter_content: '市场经济是资源配置的有效机制，通过价格信号引导资源流向最需要的地方。供求关系决定价格，价格反过来影响供求。政府在市场经济中的作用是维护市场秩序，提供公共服务，调节市场失灵。'
      },
      {
        chapter_name: '第二章：宏观调控的智慧',
        chapter_content: '宏观调控是政府调节经济运行的重要手段。通过财政政策和货币政策的配合使用，可以有效应对经济周期波动。宏观调控要把握好时机和力度，既要防止经济过热，也要避免经济衰退。'
      }
    ]
  },
  {
    book_name: '财富创造之道',
    strategy_category: '经济方略',
    chapters: [
      {
        chapter_name: '第一章：创新驱动发展',
        chapter_content: '创新是经济发展的第一动力。技术创新能够提高生产效率，创造新的产业和就业机会。企业要加大研发投入，培养创新人才，建立创新文化。政府要营造良好的创新环境，保护知识产权。'
      },
      {
        chapter_name: '第二章：可持续发展战略',
        chapter_content: '可持续发展要求经济增长与环境保护相协调。绿色发展是未来经济发展的必然选择。企业要承担社会责任，采用清洁生产技术，减少环境污染。政府要制定环保法规，引导绿色投资。'
      }
    ]
  },
  
  // 军事方略
  {
    book_name: '军事方略精要',
    strategy_category: '军事方略',
    chapters: [
      {
        chapter_name: '第一章：兵法的智慧',
        chapter_content: '兵法是军事斗争的艺术，强调知己知彼，百战不殆。军事指挥官要具备战略眼光，能够准确判断敌我形势，制定合适的作战计划。兵法不仅适用于军事领域，在商业竞争中也有重要指导意义。'
      },
      {
        chapter_name: '第二章：现代战争的特点',
        chapter_content: '现代战争具有高技术、信息化的特点。信息优势往往决定战争的胜负。军队建设要注重科技含量，提高装备水平和人员素质。现代战争也更加注重精确打击，减少附带损伤。'
      }
    ]
  },
  {
    book_name: '战略思维导论',
    strategy_category: '军事方略',
    chapters: [
      {
        chapter_name: '第一章：战略规划的要素',
        chapter_content: '战略规划需要综合考虑目标、资源、环境等多个要素。明确的战略目标是规划的前提，充足的资源是实现目标的保障，准确的环境分析是制定策略的基础。战略规划要具有前瞻性和灵活性。'
      },
      {
        chapter_name: '第二章：危机管理与应对',
        chapter_content: '危机管理是战略思维的重要组成部分。面对突发事件，要能够快速反应，果断决策。危机管理要建立预警机制，制定应急预案，组建专业团队。危机也往往蕴含机遇，善于化危为机是高明的战略智慧。'
      }
    ]
  },
  
  // 外交方略
  {
    book_name: '外交方略概论',
    strategy_category: '外交方略',
    chapters: [
      {
        chapter_name: '第一章：外交的艺术',
        chapter_content: '外交是国家间交往的艺术，需要高超的谈判技巧和深厚的文化底蕴。外交官要具备敏锐的政治嗅觉，能够准确把握国际形势的变化。外交政策要体现国家利益，同时兼顾国际责任。'
      },
      {
        chapter_name: '第二章：多边外交的策略',
        chapter_content: '多边外交是现代国际关系的重要特征。通过国际组织和多边机制，各国可以在平等基础上协商解决共同关心的问题。多边外交要求各国放弃零和思维，寻求合作共赢的解决方案。'
      }
    ]
  },
  {
    book_name: '国际关系新论',
    strategy_category: '外交方略',
    chapters: [
      {
        chapter_name: '第一章：全球化时代的外交',
        chapter_content: '全球化使各国联系更加紧密，外交的重要性日益凸显。经济外交、文化外交、公共外交等新形式不断涌现。外交不再仅仅是政府间的事务，民间外交、企业外交也发挥着重要作用。'
      },
      {
        chapter_name: '第二章：软实力与国际影响',
        chapter_content: '软实力是国家综合实力的重要组成部分，包括文化吸引力、政治感召力、外交亲和力等。提升软实力需要加强文化建设，传播本国价值理念，展示良好国家形象。软实力的影响往往更加持久和深远。'
      }
    ]
  }
];

async function createTableAndInsertData() {
  try {
    console.log('\n1. 尝试创建book_library表...');
    
    // 首先尝试插入一条测试数据来触发表的自动创建
    const testData = {
      book_name: '测试书籍',
      strategy_category: '测试分类',
      chapter_name: '测试章节',
      chapter_content: '测试内容'
    };
    
    const { data: testResult, error: testError } = await supabase
      .from('book_library')
      .insert(testData)
      .select();
    
    if (testError) {
      if (testError.code === 'PGRST116' || testError.message.includes('does not exist')) {
        console.log('❌ book_library表不存在，需要手动创建');
        console.log('\n请在Supabase Dashboard的SQL Editor中执行以下SQL:');
        console.log('\n```sql');
        console.log('CREATE TABLE book_library (');
        console.log('  id SERIAL PRIMARY KEY,');
        console.log('  book_name VARCHAR(255) NOT NULL,');
        console.log('  strategy_category VARCHAR(100) NOT NULL,');
        console.log('  chapter_name VARCHAR(255) NOT NULL,');
        console.log('  chapter_content TEXT NOT NULL,');
        console.log('  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),');
        console.log('  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()');
        console.log(');');
        console.log('```\n');
        return false;
      } else {
        console.log(`❌ 测试插入失败: ${testError.message}`);
        return false;
      }
    } else {
      console.log('✅ book_library表存在，可以插入数据');
      
      // 删除测试数据
      await supabase
        .from('book_library')
        .delete()
        .eq('book_name', '测试书籍');
      console.log('✅ 测试数据已清理');
    }
    
    console.log('\n2. 开始插入书籍数据...');
    
    let totalInserted = 0;
    
    for (const book of bookData) {
      console.log(`\n正在插入: ${book.book_name} (${book.strategy_category})`);
      
      for (const chapter of book.chapters) {
        const insertData = {
          book_name: book.book_name,
          strategy_category: book.strategy_category,
          chapter_name: chapter.chapter_name,
          chapter_content: chapter.chapter_content
        };
        
        const { data, error } = await supabase
          .from('book_library')
          .insert(insertData)
          .select();
        
        if (error) {
          console.log(`❌ 插入章节失败: ${chapter.chapter_name} - ${error.message}`);
        } else {
          console.log(`✅ 插入成功: ${chapter.chapter_name}`);
          totalInserted++;
        }
      }
    }
    
    console.log(`\n3. 数据插入完成，共插入 ${totalInserted} 条记录`);
    
    // 验证数据
    console.log('\n4. 验证插入的数据...');
    const { data: allData, error: selectError } = await supabase
      .from('book_library')
      .select('*')
      .order('id');
    
    if (selectError) {
      console.log(`❌ 数据验证失败: ${selectError.message}`);
    } else {
      console.log(`✅ 数据验证成功，共有 ${allData.length} 条记录`);
      
      // 按分类统计
      const categories = {};
      allData.forEach(item => {
        categories[item.strategy_category] = (categories[item.strategy_category] || 0) + 1;
      });
      
      console.log('\n📊 各分类数据统计:');
      Object.entries(categories).forEach(([category, count]) => {
        console.log(`  ${category}: ${count} 条记录`);
      });
    }
    
    return true;
    
  } catch (error) {
    console.error(`\n💥 操作失败: ${error.message}`);
    return false;
  }
}

// 运行创建和插入操作
createTableAndInsertData().then(success => {
  if (success) {
    console.log('\n🎉 book_library表创建和数据插入完成！');
  } else {
    console.log('\n❌ 操作未完成，请按照提示手动创建表后重新运行');
  }
}).catch(error => {
  console.error(`\n💥 程序执行错误: ${error.message}`);
});