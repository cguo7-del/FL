import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://crnfwlpcxrnqfgwqnmun.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNybmZ3bHBjeHJucWZnd3FubXVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE1MDMwNCwiZXhwIjoyMDcwNzI2MzA0fQ.mMCVXnY4JaeUZcUAcXPnHox3rqtM_eO18dx6aW1xFII';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 四大方略经纬的书籍数据
const bookData = {
  '行正持礼': [
    {
      book_name: '论语',
      chapters: [
        {
          chapter_name: '学而第一',
          chapter_content: '子曰："学而时习之，不亦说乎？有朋自远方来，不亦乐乎？人不知而不愠，不亦君子乎？"有子曰："其为人也孝弟，而好犯上者，鲜矣；不好犯上，而好作乱者，未之有也。君子务本，本立而道生。孝弟也者，其为仁之本与！"'
        },
        {
          chapter_name: '为政第二',
          chapter_content: '子曰："为政以德，譬如北辰，居其所而众星共之。"子曰："《诗》三百，一言以蔽之，曰：思无邪。"子曰："道之以政，齐之以刑，民免而无耻；道之以德，齐之以礼，有耻且格。"'
        }
      ]
    },
    {
      book_name: '孟子',
      chapters: [
        {
          chapter_name: '梁惠王章句上',
          chapter_content: '孟子见梁惠王。王曰："叟不远千里而来，亦将有以利吾国乎？"孟子对曰："王何必曰利？亦有仁义而已矣。王曰何以利吾国，大夫曰何以利吾家，士庶人曰何以利吾身，上下交征利而国危矣。"'
        },
        {
          chapter_name: '公孙丑章句上',
          chapter_content: '公孙丑问曰："夫子当路于齐，管仲、晏子之功，可复许乎？"孟子曰："子诚齐人也，知管仲、晏子而已矣。或问乎曾西曰：吾子与子路孰贤？曾西蹴然曰：吾先子之所畏也。曰：然则吾子与管仲孰贤？曾西艴然不悦，曰：尔何曾比予于管仲！"'
        }
      ]
    },
    {
      book_name: '礼记',
      chapters: [
        {
          chapter_name: '大学',
          chapter_content: '大学之道，在明明德，在亲民，在止于至善。知止而后有定，定而后能静，静而后能安，安而后能虑，虑而后能得。物有本末，事有终始，知所先后，则近道矣。古之欲明明德于天下者，先治其国；欲治其国者，先齐其家；欲齐其家者，先修其身。'
        },
        {
          chapter_name: '中庸',
          chapter_content: '天命之谓性，率性之谓道，修道之谓教。道也者，不可须臾离也，可离非道也。是故君子戒慎乎其所不睹，恐惧乎其所不闻。莫见乎隐，莫显乎微，故君子慎其独也。喜怒哀乐之未发，谓之中；发而皆中节，谓之和。中也者，天下之大本也；和也者，天下之达道也。'
        }
      ]
    },
    {
      book_name: '近思录',
      chapters: [
        {
          chapter_name: '道体',
          chapter_content: '濂溪先生曰："无极而太极。太极动而生阳，动极而静，静而生阴，静极复动。一动一静，互为其根；分阴分阳，两仪立焉。阳变阴合，而生水火木金土。五气顺布，四时行焉。五行一阴阳也，阴阳一太极也，太极本无极也。"'
        },
        {
          chapter_name: '为学大要',
          chapter_content: '明道先生曰："学者须先识仁。仁者，浑然与物同体。义、礼、智、信皆仁也。识得此理，以诚敬存之耳，不须防检，不须穷索。若心懈则有防，心苟不懈，何防之有？理有未得，故须穷索；存久自明，安待穷索？"'
        }
      ]
    }
  ],
  '顺势而为': [
    {
      book_name: '道德经',
      chapters: [
        {
          chapter_name: '第一章',
          chapter_content: '道可道，非常道；名可名，非常名。无名天地之始，有名万物之母。故常无欲，以观其妙；常有欲，以观其徼。此两者同出而异名，同谓之玄，玄之又玄，众妙之门。'
        },
        {
          chapter_name: '第八章',
          chapter_content: '上善若水。水善利万物而不争，处众人之所恶，故几于道。居善地，心善渊，与善仁，言善信，政善治，事善能，动善时。夫唯不争，故无尤。'
        }
      ]
    },
    {
      book_name: '庄子',
      chapters: [
        {
          chapter_name: '逍遥游',
          chapter_content: '北冥有鱼，其名为鲲。鲲之大，不知其几千里也；化而为鸟，其名为鹏。鹏之背，不知其几千里也；怒而飞，其翼若垂天之云。是鸟也，海运则将徙于南冥。南冥者，天池也。'
        },
        {
          chapter_name: '齐物论',
          chapter_content: '南郭子綦隐机而坐，仰天而嘘，答焉似丧其耦。颜成子游立侍乎前，曰："何居乎？形固可使如槁木，而心固可使如死灰乎？今之隐机者，非昔之隐机者也。"子綦曰："偃，不亦善乎，而问之也！今者吾丧我，汝知之乎？"'
        }
      ]
    },
    {
      book_name: '淮南子',
      chapters: [
        {
          chapter_name: '原道训',
          chapter_content: '夫道者，覆天载地，廓四方，柝八极，高不可际，深不可测，包裹天地，禀受无形，原流泉浡，冲而徐盈，浊以静之徐清，施之无劳，取之不损，处之不厚，用之不勤。'
        },
        {
          chapter_name: '俶真训',
          chapter_content: '夫无为者，非谓其凝滞而不动也，以其言莫从己出也。夫道者，陶冶万物，终始无形，寂然不动，大通混冥，深闳广大，不可为外，析毫剖芒，不可为内，无环堵之宇，而生有无之总名也。'
        }
      ]
    }
  ],
  '巧谋实战': [
    {
      book_name: '孙子兵法',
      chapters: [
        {
          chapter_name: '始计篇',
          chapter_content: '孙子曰：兵者，国之大事，死生之地，存亡之道，不可不察也。故经之以五事，校之以计，而索其情：一曰道，二曰天，三曰地，四曰将，五曰法。道者，令民与上同意也，故可以与之死，可以与之生，而不畏危。'
        },
        {
          chapter_name: '作战篇',
          chapter_content: '孙子曰：凡用兵之法，驰车千驷，革车千乘，带甲十万，千里馈粮，则内外之费，宾客之用，胶漆之材，车甲之奉，日费千金，然后十万之师举矣。其用战也，胜久则钝兵挫锐，攻城则力屈，久暴师则国用不足。'
        }
      ]
    },
    {
      book_name: '鬼谷子',
      chapters: [
        {
          chapter_name: '捭阖第一',
          chapter_content: '粤若稽古圣人之在天地间也，为众生之先，观阴阳之开阖以命物，知存亡之门户，筹策万类之终始，达人心之理，见变化之朕焉，而守司其门户。故圣人之在天下也，自古及今，其道一也。'
        },
        {
          chapter_name: '反应第二',
          chapter_content: '古之大化者，乃与无形俱生。反以观往，复以验来；反以知古，复以知今；反以知彼，复以知己。动静虚实之理，不合来今，反古而求之。事有反而得复者，圣人之意也，不可不察。'
        }
      ]
    },
    {
      book_name: '资治通鉴',
      chapters: [
        {
          chapter_name: '周纪一',
          chapter_content: '威烈王二十三年，初命晋大夫魏斯、赵籍、韩虔为诸侯。臣光曰：臣闻天子之职莫大于礼，礼莫大于分，分莫大于名。何谓礼？纪纲是也。何谓分？君臣是也。何谓名？公、侯、卿、大夫是也。'
        },
        {
          chapter_name: '秦纪一',
          chapter_content: '始皇帝二十六年，初并天下，令丞相、御史曰："异日韩王纳地效玺，请为藩臣，已而倍约，与赵、魏合从畔秦，故兴兵诛之，虏其王。寡人以眇眇之身，兴兵诛暴乱，赖宗庙之灵，六王咸伏其辜，天下大定。"'
        }
      ]
    },
    {
      book_name: '三十六计',
      chapters: [
        {
          chapter_name: '胜战计',
          chapter_content: '瞒天过海：备周则意怠，常见则不疑。阴在阳之内，不在阳之对。太阳，太阴。围魏救赵：共敌不如分敌，敌阳不如敌阴。声东击西：敌志乱萃，不虞，坤下兑上之象。利其不自主而取之。'
        },
        {
          chapter_name: '敌战计',
          chapter_content: '以逸待劳：困敌之势，不以战；损刚益柔。趁火打劫：敌之害大，就势取利，刚决柔也。声东击西：乱志乱萃，不虞，坤下兑上之象。利其不自主而取之。'
        }
      ]
    }
  ],
  '运筹帷幄': [
    {
      book_name: '韩非子',
      chapters: [
        {
          chapter_name: '孤愤',
          chapter_content: '智术之士，必远于刑戮；谏说之士，必困于诽谤；正直之士，必死于诛杀。故明主之国，无书简之文，以法为教；无先王之语，以吏为师。今废先王之德教，而法后王之政令，则是学不道德而学暴乱也。'
        },
        {
          chapter_name: '说难',
          chapter_content: '凡说之难，非吾知之有以说之难也，又非吾辩之难能明吾意之难也；又非吾敢横失能尽之难也。凡说之难，在知所说之心，可以吾说当之。所说出于为名高者也，而说之以厚利，则见下节而遇卑贱，必弃远矣。'
        }
      ]
    },
    {
      book_name: '商君书',
      chapters: [
        {
          chapter_name: '更法',
          chapter_content: '孝公平画，公孙鞅、甘龙、杜挚三人议于前。公孙鞅曰："治世不一道，便国不必法古。汤、武之王也，不循古而兴；殷、夏之灭也，不易礼而亡。然则反古者未必可非，循礼者未足多是也。"'
        },
        {
          chapter_name: '垦令',
          chapter_content: '无宿治，则邪官不及为私利于民，而百姓困于耕战。愚心躁欲之民壹意，则技巧之民无所食，技巧之民无所食，则必农。愚心躁欲之民壹意，则欲民不偷营于商贾，技巧之民不淫学于事末。'
        }
      ]
    },
    {
      book_name: '盐铁论',
      chapters: [
        {
          chapter_name: '本议',
          chapter_content: '大夫曰："往者郡国诸侯各以其物贡输，往来烦杂，物多苦恶，或不偿其费。故郡置输官以相给运，而便远方之贡，故曰输官。"贤良曰："孔子曰：节用而爱人，使民以时。先王之道，天下之纪纲也。"'
        },
        {
          chapter_name: '力耕',
          chapter_content: '大夫曰："王者塞民之养，隘其利途。故予之在农，不在商也。是以先王制井田之法而口分之，设庐井之居而族处之，所以禁兼并，抑淫侈也。"文学曰："古者制田百步为亩，民井田而耕，什一而税，则国给民富而颂声作。"'
        }
      ]
    },
    {
      book_name: '贞观政要',
      chapters: [
        {
          chapter_name: '政体',
          chapter_content: '贞观初，太宗谓侍臣曰："为君之道，必须先存百姓。若损百姓以奉其身，犹割股以啖腹，腹饱而身毙。若安天下，必须先正其身，未有身正而影曲，上治而下乱者。"'
        },
        {
          chapter_name: '任贤',
          chapter_content: '贞观二年，太宗谓侍臣曰："朕每夜恒思被甲执锐，经营四方，犹恐不逮。今四海安静，无事之时，若纵情肆欲，则当时之功，一朝而弃。殷鉴不远，朕所以不敢忘怀。"房玄龄对曰："陛下不以既往为功，常以将来为虑，诚可谓至德也。"'
        }
      ]
    }
  ]
};

async function updateBookLibraryData() {
  console.log('🚀 开始更新book_library表数据');
  console.log('=' .repeat(50));
  
  try {
    // 1. 删除现有数据
    console.log('1. 删除现有数据...');
    const { error: deleteError } = await supabase
      .from('book_library')
      .delete()
      .neq('id', 0); // 删除所有记录
    
    if (deleteError) {
      console.error('❌ 删除数据失败:', deleteError);
      return;
    }
    console.log('✅ 现有数据已清理');
    
    // 2. 插入新数据
    console.log('\n2. 开始插入新的四大方略经纬数据...');
    let totalInserted = 0;
    
    for (const [strategy, books] of Object.entries(bookData)) {
      console.log(`\n正在处理: ${strategy}`);
      
      for (const book of books) {
        console.log(`  插入书籍: ${book.book_name}`);
        
        for (const chapter of book.chapters) {
          const insertData = {
            book_name: book.book_name,
            strategy_category: strategy,
            chapter_name: chapter.chapter_name,
            chapter_content: chapter.chapter_content
          };
          
          const { error: insertError } = await supabase
            .from('book_library')
            .insert([insertData]);
          
          if (insertError) {
            console.error(`    ❌ 插入失败 (${chapter.chapter_name}):`, insertError);
          } else {
            console.log(`    ✅ 插入成功: ${chapter.chapter_name}`);
            totalInserted++;
          }
        }
      }
    }
    
    // 3. 验证插入的数据
    console.log('\n3. 验证插入的数据...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('book_library')
      .select('*');
    
    if (verifyError) {
      console.error('❌ 验证数据失败:', verifyError);
      return;
    }
    
    console.log(`✅ 数据验证成功，共有 ${verifyData.length} 条记录`);
    
    // 4. 统计各分类数据
    console.log('\n📊 各分类数据统计:');
    const stats = {};
    verifyData.forEach(record => {
      stats[record.strategy_category] = (stats[record.strategy_category] || 0) + 1;
    });
    
    Object.entries(stats).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} 条记录`);
    });
    
    console.log('\n🎉 四大方略经纬数据更新完成！');
    console.log('包含：行正持礼、顺势而为、巧谋实战、运筹帷幄');
    
  } catch (error) {
    console.error('❌ 操作过程中出错:', error);
  }
}

// 执行数据更新
updateBookLibraryData().then(() => {
  console.log('\n✅ 数据更新任务完成');
  process.exit(0);
}).catch(error => {
  console.error('❌ 数据更新任务失败:', error);
  process.exit(1);
});