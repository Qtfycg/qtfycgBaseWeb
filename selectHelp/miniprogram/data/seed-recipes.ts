// 内置菜谱种子数据（Story 5）
// 由 seed-recipes.json 转换而来；改为 TS 导出以保证微信开发者工具编译兼容
import { Recipe } from '../types'

export const SEED_RECIPES: Recipe[] = [
  {
    "id": "r001",
    "name": "番茄炒蛋",
    "description": "国民家常菜，酸甜开胃，10 分钟出锅",
    "mealPeriods": [
      "lunch",
      "dinner"
    ],
    "tasteTags": [
      "酸甜"
    ],
    "cuisineTags": [
      "家常"
    ],
    "temperatureTags": [
      "warm"
    ],
    "baseServings": 2,
    "durationMinutes": 10,
    "estimatedCost": 8,
    "mainIngredientIds": [
      "tomato",
      "egg"
    ],
    "ingredients": [
      {
        "ingredientId": "tomato",
        "name": "番茄",
        "amount": 2,
        "unit": "个",
        "unitCategory": "count"
      },
      {
        "ingredientId": "egg",
        "name": "鸡蛋",
        "amount": 3,
        "unit": "个",
        "unitCategory": "count"
      },
      {
        "ingredientId": "scallion",
        "name": "小葱",
        "amount": 1,
        "unit": "根",
        "unitCategory": "count"
      },
      {
        "ingredientId": "salt",
        "name": "盐",
        "amount": 3,
        "unit": "克",
        "unitCategory": "weight"
      }
    ],
    "steps": [
      "番茄切块，鸡蛋打散加少许盐",
      "热油下蛋液炒至凝固盛出",
      "下番茄炒出汁，加盐调味",
      "倒入鸡蛋翻炒均匀，撒葱花出锅"
    ],
    "source": "builtin",
    "contentVersion": 1
  },
  {
    "id": "r002",
    "name": "青椒肉丝",
    "description": "经典下饭菜，微辣咸香",
    "mealPeriods": [
      "lunch",
      "dinner"
    ],
    "tasteTags": [
      "咸香",
      "微辣"
    ],
    "cuisineTags": [
      "家常",
      "川菜"
    ],
    "temperatureTags": [
      "hot"
    ],
    "baseServings": 2,
    "durationMinutes": 15,
    "estimatedCost": 15,
    "mainIngredientIds": [
      "pork",
      "green_pepper"
    ],
    "ingredients": [
      {
        "ingredientId": "pork",
        "name": "猪里脊",
        "amount": 200,
        "unit": "克",
        "unitCategory": "weight"
      },
      {
        "ingredientId": "green_pepper",
        "name": "青椒",
        "amount": 2,
        "unit": "个",
        "unitCategory": "count"
      },
      {
        "ingredientId": "garlic",
        "name": "大蒜",
        "amount": 2,
        "unit": "瓣",
        "unitCategory": "count"
      },
      {
        "ingredientId": "soy_sauce",
        "name": "生抽",
        "amount": 1,
        "unit": "勺",
        "unitCategory": "descriptive"
      }
    ],
    "steps": [
      "肉丝加生抽、淀粉腌制 5 分钟",
      "青椒切丝，蒜切片",
      "热油滑炒肉丝至变色盛出",
      "爆香蒜片，下青椒翻炒",
      "倒入肉丝，加生抽调味炒匀"
    ],
    "source": "builtin",
    "contentVersion": 1
  },
  {
    "id": "r003",
    "name": "土豆炖牛腩",
    "description": "一锅炖的暖胃硬菜，周末加餐首选",
    "mealPeriods": [
      "dinner"
    ],
    "tasteTags": [
      "咸香"
    ],
    "cuisineTags": [
      "家常"
    ],
    "temperatureTags": [
      "hot",
      "soup"
    ],
    "baseServings": 3,
    "durationMinutes": 60,
    "estimatedCost": 40,
    "mainIngredientIds": [
      "beef",
      "potato"
    ],
    "ingredients": [
      {
        "ingredientId": "beef",
        "name": "牛腩",
        "amount": 500,
        "unit": "克",
        "unitCategory": "weight"
      },
      {
        "ingredientId": "potato",
        "name": "土豆",
        "amount": 3,
        "unit": "个",
        "unitCategory": "count"
      },
      {
        "ingredientId": "ginger",
        "name": "生姜",
        "amount": 3,
        "unit": "片",
        "unitCategory": "count"
      },
      {
        "ingredientId": "cooking_wine",
        "name": "料酒",
        "amount": 2,
        "unit": "勺",
        "unitCategory": "descriptive"
      }
    ],
    "steps": [
      "牛腩切块焯水去浮沫",
      "热油爆香姜片，下牛腩翻炒",
      "加料酒、热水没过牛腩，小火炖 40 分钟",
      "加入土豆块再炖 20 分钟，加盐调味"
    ],
    "source": "builtin",
    "contentVersion": 1
  },
  {
    "id": "r004",
    "name": "清蒸鲈鱼",
    "description": "鲜嫩清淡，粤式做法，宴客拿手菜",
    "mealPeriods": [
      "lunch",
      "dinner"
    ],
    "tasteTags": [
      "清淡"
    ],
    "cuisineTags": [
      "粤菜"
    ],
    "temperatureTags": [
      "hot"
    ],
    "baseServings": 2,
    "durationMinutes": 20,
    "estimatedCost": 30,
    "mainIngredientIds": [
      "sea_bass"
    ],
    "ingredients": [
      {
        "ingredientId": "sea_bass",
        "name": "鲈鱼",
        "amount": 1,
        "unit": "条",
        "unitCategory": "count"
      },
      {
        "ingredientId": "ginger",
        "name": "生姜",
        "amount": 4,
        "unit": "片",
        "unitCategory": "count"
      },
      {
        "ingredientId": "scallion",
        "name": "小葱",
        "amount": 2,
        "unit": "根",
        "unitCategory": "count"
      },
      {
        "ingredientId": "soy_sauce",
        "name": "生抽",
        "amount": 2,
        "unit": "勺",
        "unitCategory": "descriptive"
      }
    ],
    "steps": [
      "鲈鱼洗净，鱼身划刀，铺姜片",
      "水开后上锅蒸 8 分钟",
      "倒掉盘内汤汁，铺葱丝",
      "淋热油激香，浇生抽"
    ],
    "source": "builtin",
    "contentVersion": 1
  },
  {
    "id": "r005",
    "name": "麻婆豆腐",
    "description": "麻辣鲜香，米饭杀手",
    "mealPeriods": [
      "lunch",
      "dinner"
    ],
    "tasteTags": [
      "辣",
      "麻"
    ],
    "cuisineTags": [
      "川菜"
    ],
    "temperatureTags": [
      "hot"
    ],
    "baseServings": 2,
    "durationMinutes": 15,
    "estimatedCost": 12,
    "mainIngredientIds": [
      "tofu",
      "ground_pork"
    ],
    "ingredients": [
      {
        "ingredientId": "tofu",
        "name": "嫩豆腐",
        "amount": 400,
        "unit": "克",
        "unitCategory": "weight"
      },
      {
        "ingredientId": "ground_pork",
        "name": "猪肉末",
        "amount": 100,
        "unit": "克",
        "unitCategory": "weight"
      },
      {
        "ingredientId": "doubanjiang",
        "name": "豆瓣酱",
        "amount": 1,
        "unit": "勺",
        "unitCategory": "descriptive"
      },
      {
        "ingredientId": "peppercorn",
        "name": "花椒粉",
        "amount": 2,
        "unit": "克",
        "unitCategory": "weight"
      }
    ],
    "steps": [
      "豆腐切块，盐水焯烫去豆腥",
      "热油炒香肉末和豆瓣酱",
      "加半碗水，放入豆腐煮 3 分钟",
      "水淀粉勾芡，撒花椒粉和葱花"
    ],
    "source": "builtin",
    "contentVersion": 1
  },
  {
    "id": "r006",
    "name": "宫保鸡丁",
    "description": "酸甜微辣，花生酥脆",
    "mealPeriods": [
      "lunch",
      "dinner"
    ],
    "tasteTags": [
      "酸甜",
      "微辣"
    ],
    "cuisineTags": [
      "川菜"
    ],
    "temperatureTags": [
      "hot"
    ],
    "baseServings": 2,
    "durationMinutes": 20,
    "estimatedCost": 18,
    "mainIngredientIds": [
      "chicken",
      "peanut"
    ],
    "ingredients": [
      {
        "ingredientId": "chicken",
        "name": "鸡胸肉",
        "amount": 250,
        "unit": "克",
        "unitCategory": "weight"
      },
      {
        "ingredientId": "peanut",
        "name": "花生米",
        "amount": 50,
        "unit": "克",
        "unitCategory": "weight"
      },
      {
        "ingredientId": "dried_chili",
        "name": "干辣椒",
        "amount": 5,
        "unit": "个",
        "unitCategory": "count"
      },
      {
        "ingredientId": "vinegar",
        "name": "香醋",
        "amount": 1,
        "unit": "勺",
        "unitCategory": "descriptive"
      }
    ],
    "steps": [
      "鸡丁加生抽淀粉腌制，调好糖醋汁",
      "花生米小火炸酥备用",
      "爆香干辣椒，下鸡丁滑炒至变色",
      "倒入糖醋汁翻炒收汁，加花生米出锅"
    ],
    "source": "builtin",
    "contentVersion": 1
  },
  {
    "id": "r007",
    "name": "白灼菜心",
    "description": "清爽绿叶菜，广式经典",
    "mealPeriods": [
      "lunch",
      "dinner"
    ],
    "tasteTags": [
      "清淡"
    ],
    "cuisineTags": [
      "粤菜"
    ],
    "temperatureTags": [
      "warm"
    ],
    "baseServings": 2,
    "durationMinutes": 8,
    "estimatedCost": 6,
    "mainIngredientIds": [
      "choy_sum"
    ],
    "ingredients": [
      {
        "ingredientId": "choy_sum",
        "name": "菜心",
        "amount": 300,
        "unit": "克",
        "unitCategory": "weight"
      },
      {
        "ingredientId": "garlic",
        "name": "大蒜",
        "amount": 2,
        "unit": "瓣",
        "unitCategory": "count"
      },
      {
        "ingredientId": "soy_sauce",
        "name": "生抽",
        "amount": 1,
        "unit": "勺",
        "unitCategory": "descriptive"
      }
    ],
    "steps": [
      "菜心洗净，水开加盐和油",
      "下菜心焯烫 1 分钟捞出摆盘",
      "蒜末爆香，加生抽淋在菜心上"
    ],
    "source": "builtin",
    "contentVersion": 1
  },
  {
    "id": "r008",
    "name": "凉拌黄瓜",
    "description": "夏日开胃凉菜，5 分钟搞定",
    "mealPeriods": [
      "lunch",
      "dinner"
    ],
    "tasteTags": [
      "酸辣",
      "清淡"
    ],
    "cuisineTags": [
      "家常"
    ],
    "temperatureTags": [
      "cold"
    ],
    "baseServings": 2,
    "durationMinutes": 5,
    "estimatedCost": 4,
    "mainIngredientIds": [
      "cucumber"
    ],
    "ingredients": [
      {
        "ingredientId": "cucumber",
        "name": "黄瓜",
        "amount": 2,
        "unit": "根",
        "unitCategory": "count"
      },
      {
        "ingredientId": "garlic",
        "name": "大蒜",
        "amount": 3,
        "unit": "瓣",
        "unitCategory": "count"
      },
      {
        "ingredientId": "vinegar",
        "name": "香醋",
        "amount": 2,
        "unit": "勺",
        "unitCategory": "descriptive"
      },
      {
        "ingredientId": "chili_oil",
        "name": "辣椒油",
        "amount": 1,
        "unit": "勺",
        "unitCategory": "descriptive"
      }
    ],
    "steps": [
      "黄瓜拍碎切段，加盐腌 5 分钟倒掉汁水",
      "蒜末、醋、辣椒油调成料汁",
      "料汁淋入黄瓜拌匀即可"
    ],
    "source": "builtin",
    "contentVersion": 1
  },
  {
    "id": "r009",
    "name": "紫菜蛋花汤",
    "description": "5 分钟快手汤，配饭配面都合适",
    "mealPeriods": [
      "lunch",
      "dinner",
      "late_night"
    ],
    "tasteTags": [
      "清淡"
    ],
    "cuisineTags": [
      "家常"
    ],
    "temperatureTags": [
      "soup"
    ],
    "baseServings": 2,
    "durationMinutes": 5,
    "estimatedCost": 3,
    "mainIngredientIds": [
      "seaweed",
      "egg"
    ],
    "ingredients": [
      {
        "ingredientId": "seaweed",
        "name": "紫菜",
        "amount": 5,
        "unit": "克",
        "unitCategory": "weight"
      },
      {
        "ingredientId": "egg",
        "name": "鸡蛋",
        "amount": 1,
        "unit": "个",
        "unitCategory": "count"
      },
      {
        "ingredientId": "scallion",
        "name": "小葱",
        "amount": 1,
        "unit": "根",
        "unitCategory": "count"
      },
      {
        "ingredientId": "salt",
        "name": "盐",
        "amount": 3,
        "unit": "克",
        "unitCategory": "weight"
      }
    ],
    "steps": [
      "水烧开，放入撕碎的紫菜",
      "蛋液打散，画圈淋入成蛋花",
      "加盐调味，撒葱花出锅"
    ],
    "source": "builtin",
    "contentVersion": 1
  },
  {
    "id": "r010",
    "name": "蛋炒饭",
    "description": "隔夜饭的最佳归宿，一人食友好",
    "mealPeriods": [
      "breakfast",
      "lunch",
      "late_night"
    ],
    "tasteTags": [
      "咸香"
    ],
    "cuisineTags": [
      "家常"
    ],
    "temperatureTags": [
      "hot"
    ],
    "baseServings": 1,
    "durationMinutes": 8,
    "estimatedCost": 5,
    "mainIngredientIds": [
      "rice",
      "egg"
    ],
    "ingredients": [
      {
        "ingredientId": "rice",
        "name": "米饭",
        "amount": 300,
        "unit": "克",
        "unitCategory": "weight"
      },
      {
        "ingredientId": "egg",
        "name": "鸡蛋",
        "amount": 2,
        "unit": "个",
        "unitCategory": "count"
      },
      {
        "ingredientId": "scallion",
        "name": "小葱",
        "amount": 1,
        "unit": "根",
        "unitCategory": "count"
      },
      {
        "ingredientId": "soy_sauce",
        "name": "生抽",
        "amount": 1,
        "unit": "勺",
        "unitCategory": "descriptive"
      }
    ],
    "steps": [
      "蛋液炒散盛出",
      "米饭下锅炒散，压平炒匀",
      "倒入鸡蛋，加生抽和盐调味",
      "撒葱花翻炒出锅"
    ],
    "source": "builtin",
    "contentVersion": 1
  },
  {
    "id": "r011",
    "name": "番茄鸡蛋面",
    "description": "一碗热乎汤面，早餐夜宵都合适",
    "mealPeriods": [
      "breakfast",
      "lunch",
      "late_night"
    ],
    "tasteTags": [
      "酸甜"
    ],
    "cuisineTags": [
      "家常"
    ],
    "temperatureTags": [
      "hot",
      "soup"
    ],
    "baseServings": 1,
    "durationMinutes": 10,
    "estimatedCost": 6,
    "mainIngredientIds": [
      "noodles",
      "tomato",
      "egg"
    ],
    "ingredients": [
      {
        "ingredientId": "noodles",
        "name": "挂面",
        "amount": 100,
        "unit": "克",
        "unitCategory": "weight"
      },
      {
        "ingredientId": "tomato",
        "name": "番茄",
        "amount": 1,
        "unit": "个",
        "unitCategory": "count"
      },
      {
        "ingredientId": "egg",
        "name": "鸡蛋",
        "amount": 1,
        "unit": "个",
        "unitCategory": "count"
      }
    ],
    "steps": [
      "番茄炒出汁，加水煮开",
      "下挂面煮 3 分钟",
      "淋入蛋液成蛋花，加盐调味"
    ],
    "source": "builtin",
    "contentVersion": 1
  },
  {
    "id": "r012",
    "name": "皮蛋瘦肉粥",
    "description": "绵滑养胃，早餐经典",
    "mealPeriods": [
      "breakfast",
      "late_night"
    ],
    "tasteTags": [
      "咸香"
    ],
    "cuisineTags": [
      "粤菜"
    ],
    "temperatureTags": [
      "hot",
      "soup"
    ],
    "baseServings": 2,
    "durationMinutes": 40,
    "estimatedCost": 12,
    "mainIngredientIds": [
      "rice",
      "pork",
      "century_egg"
    ],
    "ingredients": [
      {
        "ingredientId": "rice",
        "name": "大米",
        "amount": 100,
        "unit": "克",
        "unitCategory": "weight"
      },
      {
        "ingredientId": "pork",
        "name": "猪里脊",
        "amount": 80,
        "unit": "克",
        "unitCategory": "weight"
      },
      {
        "ingredientId": "century_egg",
        "name": "皮蛋",
        "amount": 1,
        "unit": "个",
        "unitCategory": "count"
      },
      {
        "ingredientId": "ginger",
        "name": "生姜",
        "amount": 2,
        "unit": "片",
        "unitCategory": "count"
      }
    ],
    "steps": [
      "大米加少量油盐腌制 10 分钟",
      "加水大火煮开转小火熬 30 分钟",
      "加入肉丝和皮蛋丁再煮 5 分钟",
      "加盐和白胡椒调味"
    ],
    "source": "builtin",
    "contentVersion": 1
  },
  {
    "id": "r013",
    "name": "蒸蛋羹",
    "description": "嫩滑如豆腐，孩子老人最爱",
    "mealPeriods": [
      "breakfast",
      "lunch"
    ],
    "tasteTags": [
      "清淡"
    ],
    "cuisineTags": [
      "家常"
    ],
    "temperatureTags": [
      "warm"
    ],
    "baseServings": 2,
    "durationMinutes": 12,
    "estimatedCost": 3,
    "mainIngredientIds": [
      "egg"
    ],
    "ingredients": [
      {
        "ingredientId": "egg",
        "name": "鸡蛋",
        "amount": 3,
        "unit": "个",
        "unitCategory": "count"
      },
      {
        "ingredientId": "scallion",
        "name": "小葱",
        "amount": 1,
        "unit": "根",
        "unitCategory": "count"
      },
      {
        "ingredientId": "soy_sauce",
        "name": "生抽",
        "amount": 1,
        "unit": "勺",
        "unitCategory": "descriptive"
      }
    ],
    "steps": [
      "蛋液加 1.5 倍温水打散过筛",
      "盖保鲜膜扎孔，水开后蒸 8 分钟",
      "淋生抽和香油，撒葱花"
    ],
    "source": "builtin",
    "contentVersion": 1
  },
  {
    "id": "r014",
    "name": "可乐鸡翅",
    "description": "甜香入味，零失败的大众菜",
    "mealPeriods": [
      "lunch",
      "dinner"
    ],
    "tasteTags": [
      "甜",
      "咸香"
    ],
    "cuisineTags": [
      "家常"
    ],
    "temperatureTags": [
      "hot"
    ],
    "baseServings": 2,
    "durationMinutes": 25,
    "estimatedCost": 20,
    "mainIngredientIds": [
      "chicken_wings",
      "cola"
    ],
    "ingredients": [
      {
        "ingredientId": "chicken_wings",
        "name": "鸡翅中",
        "amount": 8,
        "unit": "个",
        "unitCategory": "count"
      },
      {
        "ingredientId": "cola",
        "name": "可乐",
        "amount": 330,
        "unit": "毫升",
        "unitCategory": "volume"
      },
      {
        "ingredientId": "ginger",
        "name": "生姜",
        "amount": 3,
        "unit": "片",
        "unitCategory": "count"
      },
      {
        "ingredientId": "soy_sauce",
        "name": "生抽",
        "amount": 2,
        "unit": "勺",
        "unitCategory": "descriptive"
      }
    ],
    "steps": [
      "鸡翅两面划刀，焯水去腥",
      "煎至两面金黄",
      "倒入可乐和生抽，小火焖 15 分钟",
      "大火收汁即可"
    ],
    "source": "builtin",
    "contentVersion": 1
  },
  {
    "id": "r015",
    "name": "红烧肉",
    "description": "肥而不腻，入口即化",
    "mealPeriods": [
      "dinner"
    ],
    "tasteTags": [
      "咸香",
      "甜"
    ],
    "cuisineTags": [
      "家常",
      "沪菜"
    ],
    "temperatureTags": [
      "hot"
    ],
    "baseServings": 3,
    "durationMinutes": 75,
    "estimatedCost": 35,
    "mainIngredientIds": [
      "pork_belly"
    ],
    "ingredients": [
      {
        "ingredientId": "pork_belly",
        "name": "五花肉",
        "amount": 500,
        "unit": "克",
        "unitCategory": "weight"
      },
      {
        "ingredientId": "rock_sugar",
        "name": "冰糖",
        "amount": 20,
        "unit": "克",
        "unitCategory": "weight"
      },
      {
        "ingredientId": "ginger",
        "name": "生姜",
        "amount": 4,
        "unit": "片",
        "unitCategory": "count"
      },
      {
        "ingredientId": "soy_sauce",
        "name": "生抽",
        "amount": 3,
        "unit": "勺",
        "unitCategory": "descriptive"
      }
    ],
    "steps": [
      "五花肉切块焯水",
      "小火炒冰糖至琥珀色",
      "下肉块翻炒上色，加生抽和姜片",
      "加热水没过肉，小火炖 60 分钟收汁"
    ],
    "source": "builtin",
    "contentVersion": 1
  },
  {
    "id": "r016",
    "name": "蒜蓉西兰花",
    "description": "清爽营养，蒜香十足",
    "mealPeriods": [
      "lunch",
      "dinner"
    ],
    "tasteTags": [
      "清淡",
      "蒜香"
    ],
    "cuisineTags": [
      "家常"
    ],
    "temperatureTags": [
      "warm"
    ],
    "baseServings": 2,
    "durationMinutes": 10,
    "estimatedCost": 8,
    "mainIngredientIds": [
      "broccoli"
    ],
    "ingredients": [
      {
        "ingredientId": "broccoli",
        "name": "西兰花",
        "amount": 300,
        "unit": "克",
        "unitCategory": "weight"
      },
      {
        "ingredientId": "garlic",
        "name": "大蒜",
        "amount": 4,
        "unit": "瓣",
        "unitCategory": "count"
      },
      {
        "ingredientId": "salt",
        "name": "盐",
        "amount": 3,
        "unit": "克",
        "unitCategory": "weight"
      }
    ],
    "steps": [
      "西兰花掰小朵，盐水浸泡后焯水 1 分钟",
      "热油爆香蒜末",
      "下西兰花大火快炒，加盐调味"
    ],
    "source": "builtin",
    "contentVersion": 1
  },
  {
    "id": "r017",
    "name": "酸辣土豆丝",
    "description": "脆爽酸辣，快手下饭",
    "mealPeriods": [
      "lunch",
      "dinner"
    ],
    "tasteTags": [
      "酸辣"
    ],
    "cuisineTags": [
      "家常"
    ],
    "temperatureTags": [
      "hot"
    ],
    "baseServings": 2,
    "durationMinutes": 12,
    "estimatedCost": 5,
    "mainIngredientIds": [
      "potato"
    ],
    "ingredients": [
      {
        "ingredientId": "potato",
        "name": "土豆",
        "amount": 2,
        "unit": "个",
        "unitCategory": "count"
      },
      {
        "ingredientId": "dried_chili",
        "name": "干辣椒",
        "amount": 4,
        "unit": "个",
        "unitCategory": "count"
      },
      {
        "ingredientId": "vinegar",
        "name": "香醋",
        "amount": 2,
        "unit": "勺",
        "unitCategory": "descriptive"
      }
    ],
    "steps": [
      "土豆切丝泡水去淀粉",
      "爆香干辣椒",
      "大火快炒土豆丝，沿锅边淋醋",
      "加盐调味出锅"
    ],
    "source": "builtin",
    "contentVersion": 1
  },
  {
    "id": "r018",
    "name": "冬瓜排骨汤",
    "description": "清润解腻，老火汤的简易版",
    "mealPeriods": [
      "dinner"
    ],
    "tasteTags": [
      "清淡"
    ],
    "cuisineTags": [
      "粤菜"
    ],
    "temperatureTags": [
      "hot",
      "soup"
    ],
    "baseServings": 3,
    "durationMinutes": 55,
    "estimatedCost": 28,
    "mainIngredientIds": [
      "pork_ribs",
      "winter_melon"
    ],
    "ingredients": [
      {
        "ingredientId": "pork_ribs",
        "name": "排骨",
        "amount": 400,
        "unit": "克",
        "unitCategory": "weight"
      },
      {
        "ingredientId": "winter_melon",
        "name": "冬瓜",
        "amount": 300,
        "unit": "克",
        "unitCategory": "weight"
      },
      {
        "ingredientId": "ginger",
        "name": "生姜",
        "amount": 3,
        "unit": "片",
        "unitCategory": "count"
      },
      {
        "ingredientId": "salt",
        "name": "盐",
        "amount": 5,
        "unit": "克",
        "unitCategory": "weight"
      }
    ],
    "steps": [
      "排骨焯水去血沫",
      "加水姜片大火煮开转小火 40 分钟",
      "加入冬瓜块再煮 10 分钟",
      "加盐调味"
    ],
    "source": "builtin",
    "contentVersion": 1
  },
  {
    "id": "r019",
    "name": "韭菜炒蛋",
    "description": "三分钟快手下饭神器",
    "mealPeriods": [
      "lunch",
      "dinner"
    ],
    "tasteTags": [
      "咸香"
    ],
    "cuisineTags": [
      "家常"
    ],
    "temperatureTags": [
      "hot"
    ],
    "baseServings": 2,
    "durationMinutes": 8,
    "estimatedCost": 6,
    "mainIngredientIds": [
      "chives",
      "egg"
    ],
    "ingredients": [
      {
        "ingredientId": "chives",
        "name": "韭菜",
        "amount": 200,
        "unit": "克",
        "unitCategory": "weight"
      },
      {
        "ingredientId": "egg",
        "name": "鸡蛋",
        "amount": 3,
        "unit": "个",
        "unitCategory": "count"
      },
      {
        "ingredientId": "salt",
        "name": "盐",
        "amount": 3,
        "unit": "克",
        "unitCategory": "weight"
      }
    ],
    "steps": [
      "韭菜切段，蛋液打散",
      "先炒蛋至凝固盛出",
      "下韭菜大火快炒 1 分钟",
      "倒回鸡蛋，加盐炒匀出锅"
    ],
    "source": "builtin",
    "contentVersion": 1
  },
  {
    "id": "r020",
    "name": "香菇滑鸡",
    "description": "香菇与鸡肉的经典组合，蒸制更嫩",
    "mealPeriods": [
      "lunch",
      "dinner"
    ],
    "tasteTags": [
      "咸香"
    ],
    "cuisineTags": [
      "粤菜"
    ],
    "temperatureTags": [
      "hot"
    ],
    "baseServings": 2,
    "durationMinutes": 30,
    "estimatedCost": 25,
    "mainIngredientIds": [
      "chicken",
      "shiitake"
    ],
    "ingredients": [
      {
        "ingredientId": "chicken",
        "name": "鸡腿肉",
        "amount": 300,
        "unit": "克",
        "unitCategory": "weight"
      },
      {
        "ingredientId": "shiitake",
        "name": "干香菇",
        "amount": 6,
        "unit": "朵",
        "unitCategory": "count"
      },
      {
        "ingredientId": "ginger",
        "name": "生姜",
        "amount": 3,
        "unit": "片",
        "unitCategory": "count"
      },
      {
        "ingredientId": "soy_sauce",
        "name": "生抽",
        "amount": 2,
        "unit": "勺",
        "unitCategory": "descriptive"
      }
    ],
    "steps": [
      "香菇泡发切片，鸡块用生抽姜片腌 15 分钟",
      "鸡块和香菇拌匀摆盘",
      "水开上锅蒸 20 分钟",
      "出锅撒葱花"
    ],
    "source": "builtin",
    "contentVersion": 1
  }
]
