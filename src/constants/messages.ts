/**
 * 应用中使用的所有文本消息
 * 便于统一管理和未来的国际化
 */

export const MESSAGES = {
  // 按钮文本
  BUTTON: {
    EDIT_PROFILE: "编辑个人资料",
    HAS_ACCOUNT_LOGIN: "已有账号？去登录",
    NO_ACCOUNT_REGISTER: "没有账号？去注册",
  },

  // 确认消息
  CONFIRM: {
    DISCARD_CHANGES: "确定要放弃修改吗？",
  },

  // 邮箱绑定
  EMAIL_BIND: {
    BIND_FAILED: "邮箱绑定失败",
    BIND_NOW: "立即绑定",
    BIND_SUCCESS: "邮箱绑定成功",
    CODE_SEND_FAILED: "发送验证码失败",
    CODE_SENT: "验证码已发送，请查收邮箱",
    DESCRIPTION: "绑定邮箱后，您可以通过邮箱与微信小程序进行互通关联",
    LATER: "稍后再说",
    PLACEHOLDER_CODE: "请输入验证码",
    PLACEHOLDER_EMAIL: "请输入您的邮箱地址",
    TITLE: "绑定邮箱",
  },

  // 错误
  ERROR: {
    IMAGE_LOAD_FAILED: "图片加载失败",
    LOGIN_EXPIRED: "登录已过期，请重新登录",
    NETWORK_ERROR: "网络连接失败，请检查网络后重试",
    OPERATION_FAILED: "操作失败，请重试",
    PASSWORD_MISMATCH: "两次输入的密码不一致",
  },

  // 表单
  FORM: {
    ACCOUNT: "账号",
    CANCEL: "取消",
    CODE: "验证码",
    EMAIL: "邮箱",
    LOGIN: "登录",
    NAME: "昵称",
    PASSWORD: "密码",
    PASSWORD_CONFIRM: "确认密码",
    PLACEHOLDER: {
      ACCOUNT: "请输入账号",
      CODE: "请输入验证码",
      EMAIL: "请输入邮箱",
      NAME: "请输入昵称",
      PASSWORD: "请输入密码",
      PASSWORD_CONFIRM: "请再次输入密码",
      SIGNATURE: "记录生活中的美好时光 ✨",
      USERNAME: "请输入用户名",
    },
    PROCESSING: "处理中...",
    REGISTER: "注册",
    RESEND_CODE: (seconds: number) => `${seconds}秒后重试`,
    SAVE: "保存",
    SAVING: "保存中...",
    SEND_CODE: "发送验证码",
    SENDING_CODE: "发送中...",
    SIGNATURE: "个性签名",
    SUBMIT: "提交",
    USERNAME: "用户名",
  },

  // 帖子相关
  POST: {
    ADD_IMAGE: "添加图片",
    CONTENT: "内容",
    CREATE_NEW: "创建新动态",
    IMAGES: "图片",
    LOCATION: "位置",
    PLACEHOLDER: {
      CONTENT: "分享你的想法、感受或故事...",
      LOCATION: "添加位置信息（可选）",
      TAGS: "添加标签，用逗号分隔（如：旅行, 美食, 生活）",
      TITLE: "给你的动态起个吸引人的标题...",
    },
    PUBLISH: "发布动态",
    SHARE_MOMENT: "分享你的精彩瞬间",
    TAGS: "标签",
    TEXT_ONLY_TIP: "也可以创建纯文字动态",
    TITLE: "标题",
  },

  // 二维码登录
  QRCODE_LOGIN: {
    GENERATING: "生成中...",
    REFRESH_TIP: "点击刷新二维码",
    SCAN_TIP: "打开移动应用扫描二维码登录",
    STATUS_CONFIRM: "待确认",
    STATUS_PENDING: "待扫码",
    STATUS_SUCCESS: "登录成功",
    STATUS_TIMEOUT: "二维码已过期",
    TAB_ACCOUNT: "账号登录",
    TAB_QRCODE: "二维码登录",
  },

  // 状态
  STATUS: {
    CLICK_TO_LOGIN: "点击登录",
    LOADING: "加载中...",
    USER_INFO_LOAD_FAILED: "用户信息加载失败",
    WELCOME: (name: string) => `欢迎，${name}`,
  },

  // 成功消息
  SUCCESS: {
    PROFILE_UPDATED: "个人资料已更新",
    SAVE_SUCCESS: "保存成功",
  },
  // 时间格式
  TIME: {
    DAYS_AGO: (days: number) => `${days}天前`,
    HOURS_AGO: (hours: number) => `${hours}小时前`,
    JUST_NOW: "刚刚",
    MONTHS_AGO: (months: number) => `${months}个月前`,
    ONE_DAY_AGO: "1天前",
    TODAY: "今天",
    WEEKS_AGO: (weeks: number) => `${weeks}周前`,
    YEARS_AGO: (years: number) => `${years}年前`,
    YESTERDAY: "昨天",
  },
} as const;
