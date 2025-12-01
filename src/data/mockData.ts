import type { Post } from "@/types";

export const mockPosts: Post[] = [
  {
    id: "1",
    title: "今日午后的咖啡时光",
    content:
      "在这个慵懒的午后，一杯香浓的拿铁配上窗外的阳光，感觉整个世界都慢了下来。生活中的小确幸就是这样简单美好。",
    images: [
      "https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/851555/pexels-photo-851555.jpeg?auto=compress&cs=tinysrgb&w=400",
    ],
    author: {
      name: "小雨",
      avatar: "https://test.wktest.cn:3001/assets/default/boy.png",
    },
    tags: ["咖啡", "午后时光", "生活美学"],
    likes: 128,
    comments: 23,
    saves: 45,
    isLiked: false,
    isSaved: false,
    createdAt: "2025-01-10T14:30:00Z",
    location: "上海·静安区",
  },
  {
    id: "2",
    title: "周末烘焙小记",
    content: "第一次尝试做马卡龙，虽然卖相不够完美，但是味道还不错！烘焙真的是一件很治愈的事情。",
    images: [
      "https://images.pexels.com/photos/1030945/pexels-photo-1030945.jpeg?auto=compress&cs=tinysrgb&w=400",
    ],
    author: {
      name: "甜甜圈",
      avatar:
        "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100",
    },
    tags: ["烘焙", "马卡龙", "手作"],
    likes: 89,
    comments: 12,
    saves: 67,
    isLiked: true,
    isSaved: false,
    createdAt: "2025-01-10T10:15:00Z",
  },
  {
    id: "3",
    title: "城市夜景漫步",
    content: "夜晚的城市有着独特的魅力，霓虹闪烁，车水马龙，每一处风景都在诉说着这座城市的故事。",
    images: [
      "https://images.pexels.com/photos/325185/pexels-photo-325185.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/1796736/pexels-photo-1796736.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/1105766/pexels-photo-1105766.jpeg?auto=compress&cs=tinysrgb&w=400",
    ],
    author: {
      name: "夜行者",
      avatar:
        "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100",
    },
    tags: ["夜景", "城市", "摄影"],
    likes: 256,
    comments: 34,
    saves: 89,
    isLiked: false,
    isSaved: true,
    createdAt: "2025-01-09T21:45:00Z",
    location: "北京·朝阳区",
  },
  {
    id: "4",
    title: "阅读时光",
    content:
      "今天读完了一本很棒的小说，书中的故事让我思考了很多关于人生的问题。阅读真的是最好的精神食粮。",
    images: [
      "https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=400",
    ],
    author: {
      name: "书虫小姐",
      avatar:
        "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100",
    },
    tags: ["阅读", "书籍", "思考"],
    likes: 76,
    comments: 18,
    saves: 92,
    isLiked: false,
    isSaved: false,
    createdAt: "2025-01-09T16:20:00Z",
  },
  {
    id: "5",
    title: "春日花开",
    content: "公园里的樱花开了，粉色的花瓣随风飘散，仿佛下起了一场浪漫的花雨。春天真的来了！",
    images: [
      "https://images.pexels.com/photos/1766838/pexels-photo-1766838.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/1263986/pexels-photo-1263986.jpeg?auto=compress&cs=tinysrgb&w=400",
    ],
    author: {
      name: "花花世界",
      avatar:
        "https://images.pexels.com/photos/1102341/pexels-photo-1102341.jpeg?auto=compress&cs=tinysrgb&w=100",
    },
    tags: ["樱花", "春天", "自然"],
    likes: 189,
    comments: 27,
    saves: 156,
    isLiked: true,
    isSaved: true,
    createdAt: "2025-01-09T09:30:00Z",
    location: "杭州·西湖区",
  },
  {
    id: "6",
    title: "今日感悟",
    content:
      "生活就像一杯茶，不会苦一辈子，但总会苦一阵子。重要的是在苦涩中品味甘甜，在平淡中发现美好。每一天都是新的开始，每一刻都值得珍惜。愿我们都能在忙碌的生活中，找到属于自己的那份宁静与快乐。",
    images: [],
    author: {
      name: "思考者",
      avatar:
        "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100",
    },
    tags: ["感悟", "生活", "哲思"],
    likes: 342,
    comments: 56,
    saves: 128,
    isLiked: false,
    isSaved: false,
    createdAt: "2025-01-08T20:15:00Z",
  },
  {
    id: "7",
    title: "工作日常碎碎念",
    content:
      "今天又是忙碌的一天，但是完成了一个重要的项目，心情还是很不错的。虽然加班到很晚，但看到成果的那一刻，所有的疲惫都烟消云散了。努力的意义不在于立刻看到回报，而在于相信未来会更好。",
    images: [],
    author: {
      name: "职场小白",
      avatar:
        "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100",
    },
    tags: ["工作", "努力", "成长"],
    likes: 89,
    comments: 23,
    saves: 45,
    isLiked: true,
    isSaved: false,
    createdAt: "2025-01-08T18:30:00Z",
  },
  {
    id: "8",
    title: "深夜随想",
    content:
      "夜深了，城市渐渐安静下来。在这样的时刻，总是容易陷入思考。想起小时候的梦想，想起走过的路，想起遇见的人。时间真的是个神奇的东西，它带走了很多，也留下了很多。感谢所有的相遇和别离，它们都让我成为了更好的自己。",
    images: [],
    author: {
      name: "夜猫子",
      avatar:
        "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=100",
    },
    tags: ["深夜", "思考", "回忆"],
    likes: 156,
    comments: 34,
    saves: 78,
    isLiked: false,
    isSaved: true,
    createdAt: "2025-01-08T01:45:00Z",
  },
  {
    id: "9",
    title: "关于友情的思考",
    content:
      "真正的朋友不是那些在你辉煌时围绕在你身边的人，而是那些在你低谷时依然愿意陪伴你的人。友情不需要天天联系，但需要彼此惦记。一个眼神，一个微笑，就能明白对方的心意。珍惜身边的每一个真心朋友，他们是人生路上最珍贵的财富。",
    images: [],
    author: {
      name: "暖心小太阳",
      avatar:
        "https://images.pexels.com/photos/1130623/pexels-photo-1130623.jpeg?auto=compress&cs=tinysrgb&w=100",
    },
    tags: ["友情", "珍惜", "温暖"],
    likes: 267,
    comments: 42,
    saves: 189,
    isLiked: true,
    isSaved: true,
    createdAt: "2025-01-07T15:20:00Z",
  },
];
