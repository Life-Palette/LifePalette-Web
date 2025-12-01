/**
 * 应用中使用的所有文本消息
 * 便于统一管理和未来的国际化
 */

export const MESSAGES = {
  // 时间格式
  TIME: {
    JUST_NOW: "刚刚",
    HOURS_AGO: (hours: number) => `${hours}小时前`,
    DAYS_AGO: (days: number) => `${days}天前`,
    WEEKS_AGO: (weeks: number) => `${weeks}周前`,
    MONTHS_AGO: (months: number) => `${months}个月前`,
    YEARS_AGO: (years: number) => `${years}年前`,
    TODAY: "今天",
    YESTERDAY: "昨天",
    ONE_DAY_AGO: "1天前",
  },

  // 表单
  FORM: {
    LOGIN: "登录",
    REGISTER: "注册",
    ACCOUNT: "账号",
    PASSWORD: "密码",
    PASSWORD_CONFIRM: "确认密码",
    USERNAME: "用户名",
    NAME: "昵称",
    EMAIL: "邮箱",
    CODE: "验证码",
    SIGNATURE: "个性签名",
    SUBMIT: "提交",
    CANCEL: "取消",
    SAVE: "保存",
    SAVING: "保存中...",
    PROCESSING: "处理中...",
    SEND_CODE: "发送验证码",
    SENDING_CODE: "发送中...",
    RESEND_CODE: (seconds: number) => `${seconds}秒后重试`,
    PLACEHOLDER: {
      ACCOUNT: "请输入账号",
      PASSWORD: "请输入密码",
      PASSWORD_CONFIRM: "请再次输入密码",
      USERNAME: "请输入用户名",
      NAME: "请输入昵称",
      EMAIL: "请输入邮箱",
      CODE: "请输入验证码",
      SIGNATURE: "记录生活中的美好时光 ✨",
    },
  },

  // 二维码登录
  QRCODE_LOGIN: {
    TAB_ACCOUNT: "账号登录",
    TAB_QRCODE: "二维码登录",
    SCAN_TIP: "打开移动应用扫描二维码登录",
    STATUS_PENDING: "待扫码",
    STATUS_CONFIRM: "待确认",
    STATUS_TIMEOUT: "二维码已过期",
    STATUS_SUCCESS: "登录成功",
    REFRESH_TIP: "点击刷新二维码",
    GENERATING: "生成中...",
  },

  // 状态
  STATUS: {
    LOADING: "加载中...",
    WELCOME: (name: string) => `欢迎，${name}`,
    CLICK_TO_LOGIN: "点击登录",
    USER_INFO_LOAD_FAILED: "用户信息加载失败",
  },

  // 错误
  ERROR: {
    OPERATION_FAILED: "操作失败，请重试",
    IMAGE_LOAD_FAILED: "图片加载失败",
    NETWORK_ERROR: "网络连接失败，请检查网络后重试",
    LOGIN_EXPIRED: "登录已过期，请重新登录",
    PASSWORD_MISMATCH: "两次输入的密码不一致",
  },

  // 成功消息
  SUCCESS: {
    SAVE_SUCCESS: "保存成功",
    PROFILE_UPDATED: "个人资料已更新",
  },

  // 确认消息
  CONFIRM: {
    DISCARD_CHANGES: "确定要放弃修改吗？",
  },

  // 按钮文本
  BUTTON: {
    NO_ACCOUNT_REGISTER: "没有账号？去注册",
    HAS_ACCOUNT_LOGIN: "已有账号？去登录",
    EDIT_PROFILE: "编辑个人资料",
  },

  // 帖子相关
  POST: {
    CREATE_NEW: "创建新动态",
    SHARE_MOMENT: "分享你的精彩瞬间",
    TITLE: "标题",
    CONTENT: "内容",
    TAGS: "标签",
    LOCATION: "位置",
    IMAGES: "图片",
    PUBLISH: "发布动态",
    PLACEHOLDER: {
      TITLE: "给你的动态起个吸引人的标题...",
      CONTENT: "分享你的想法、感受或故事...",
      TAGS: "添加标签，用逗号分隔（如：旅行, 美食, 生活）",
      LOCATION: "添加位置信息（可选）",
    },
    ADD_IMAGE: "添加图片",
    TEXT_ONLY_TIP: "也可以创建纯文字动态",
  },
} as const;
