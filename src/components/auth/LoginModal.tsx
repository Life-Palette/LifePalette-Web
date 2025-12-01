import { AlertCircle, CheckCircle, Smile } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { config } from "@/config/env";
import { MESSAGES } from "@/constants/messages";
import { useLogin, useLoginByCode, useRegister, useResetPassword } from "@/hooks/useAuth";
import { useQRCodeLogin } from "@/hooks/useQRCodeLogin";
import { cn } from "@/lib/utils";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface QRCodeOverlayProps {
  status: "confirm" | "timeout" | "success";
  onRefresh: () => void;
}

function QRCodeOverlay({ status, onRefresh }: QRCodeOverlayProps) {
  const overlayConfig = {
    confirm: {
      maskColor: "bg-white/80",
      icon: <CheckCircle className="w-12 h-12 text-green-500" />,
      text: null,
      clickable: false,
    },
    timeout: {
      maskColor: "bg-black/50",
      icon: <AlertCircle className="w-12 h-12 text-red-500" />,
      text: MESSAGES.QRCODE_LOGIN.REFRESH_TIP,
      clickable: true,
    },
    success: {
      maskColor: "bg-white/80",
      icon: <Smile className="w-12 h-12 text-green-500" />,
      text: null,
      clickable: false,
    },
  };

  const config = overlayConfig[status];

  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center",
        config.clickable && "cursor-pointer",
      )}
      onClick={config.clickable ? onRefresh : undefined}
    >
      <div className={cn("absolute inset-0", config.maskColor)} />
      <div className="relative z-10 flex flex-col items-center space-y-2">
        {config.icon}
        {config.text && <p className="text-sm text-white font-medium">{config.text}</p>}
      </div>
    </div>
  );
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loginMethod, setLoginMethod] = useState<"account" | "qrcode">("account");
  const [useCodeLogin, setUseCodeLogin] = useState(false); // 是否使用验证码登录
  const [isResetPassword, setIsResetPassword] = useState(false); // 是否重置密码
  const [formData, setFormData] = useState({
    account: "",
    password: "",
    password_confirm: "",
    email: "",
    code: "",
  });
  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const loginMutation = useLogin();
  const loginByCodeMutation = useLoginByCode();
  const registerMutation = useRegister();
  const resetPasswordMutation = useResetPassword();

  // 二维码登录Hook
  const {
    qrImageUrl,
    qrStatus,
    isLoading: qrLoading,
    error: qrError,
    refreshQRCode,
  } = useQRCodeLogin({
    enabled: isOpen && loginMethod === "qrcode",
    onSuccess: () => {
      onSuccess();
      onClose();
    },
  });

  if (!isOpen) {
    return null;
  }

  // 发送验证码
  const handleSendCode = async () => {
    // 验证码登录和重置密码时使用account，注册时使用email
    const emailOrAccount = isLogin ? formData.account : formData.email;

    if (!emailOrAccount) {
      return;
    }

    setSendingCode(true);
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/code/sendEmail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailOrAccount }),
      });

      const data = await response.json();
      if (data.code === 200) {
        toast.success("验证码已发送，请查收邮箱");
        // 开始倒计时
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        // 处理错误
        if (Array.isArray(data.msg) && data.msg.length > 0) {
          const errorMessages = data.msg.map((err: any) => err.message).join(", ");
          toast.error(errorMessages);
        } else {
          toast.error(data.msg || data.message || "发送验证码失败");
        }
      }
    } catch (error) {
      console.error("发送验证码失败:", error);
      toast.error("发送验证码失败，请重试");
    } finally {
      setSendingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 注册或重置密码时验证两次密码是否一致
    if ((!isLogin || isResetPassword) && formData.password !== formData.password_confirm) {
      toast.error(MESSAGES.ERROR.PASSWORD_MISMATCH);
      return;
    }

    try {
      if (isResetPassword) {
        // 重置密码
        const result = await resetPasswordMutation.mutateAsync({
          account: formData.account,
          code: formData.code,
          password: formData.password,
          password_confirm: formData.password_confirm,
        });

        if (result.code === 200) {
          toast.success("密码重置成功，请使用新密码登录");
          setIsResetPassword(false);
          // 重置表单
          setFormData({
            account: "",
            password: "",
            password_confirm: "",
            email: "",
            code: "",
          });
        }
      } else if (isLogin) {
        let result;

        if (useCodeLogin) {
          // 验证码登录
          result = await loginByCodeMutation.mutateAsync({
            account: formData.account,
            code: formData.code,
          });
        } else {
          // 账号密码登录
          result = await loginMutation.mutateAsync({
            account: formData.account,
            password: formData.password,
          });
        }

        if (result.code === 200) {
          toast.success("登录成功");
          onSuccess();
          onClose();
          // 重置表单
          setFormData({
            account: "",
            password: "",
            password_confirm: "",
            email: "",
            code: "",
          });
        }
      } else {
        const result = await registerMutation.mutateAsync({
          email: formData.email,
          password: formData.password,
          password_confirm: formData.password_confirm,
          code: formData.code,
        });

        if (result.code === 200) {
          toast.success("注册成功");
          onSuccess();
          onClose();
          // 重置表单
          setFormData({
            account: "",
            password: "",
            password_confirm: "",
            email: "",
            code: "",
          });
        }
      }
    } catch (error) {
      // 显示错误toast
      const errorMessage = error instanceof Error ? error.message : MESSAGES.ERROR.OPERATION_FAILED;
      toast.error(errorMessage);
    }
  };

  const currentMutation = isResetPassword
    ? resetPasswordMutation
    : isLogin
      ? useCodeLogin
        ? loginByCodeMutation
        : loginMutation
      : registerMutation;
  const error = currentMutation.error as any;

  return (
    <Dialog onOpenChange={onClose} open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isResetPassword ? "重置密码" : isLogin ? MESSAGES.FORM.LOGIN : MESSAGES.FORM.REGISTER}
          </DialogTitle>
        </DialogHeader>

        <Tabs
          defaultValue="account"
          onValueChange={(value) => setLoginMethod(value as "account" | "qrcode")}
          value={loginMethod}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="account">{MESSAGES.QRCODE_LOGIN.TAB_ACCOUNT}</TabsTrigger>
            <TabsTrigger value="qrcode">{MESSAGES.QRCODE_LOGIN.TAB_QRCODE}</TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <form className="space-y-4" onSubmit={handleSubmit}>
              {isResetPassword ? (
                <>
                  {/* 重置密码表单 */}
                  <div className="space-y-2">
                    <Label htmlFor="account">{MESSAGES.FORM.ACCOUNT}</Label>
                    <Input
                      id="account"
                      onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                      placeholder={MESSAGES.FORM.PLACEHOLDER.ACCOUNT}
                      required
                      type="text"
                      value={formData.account}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="code">{MESSAGES.FORM.CODE}</Label>
                    <div className="flex gap-2">
                      <Input
                        className="flex-1"
                        id="code"
                        inputMode="numeric"
                        maxLength={4}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                          setFormData({ ...formData, code: value });
                        }}
                        placeholder={MESSAGES.FORM.PLACEHOLDER.CODE}
                        required
                        type="text"
                        value={formData.code}
                      />
                      <Button
                        className="whitespace-nowrap"
                        disabled={sendingCode || countdown > 0 || !formData.account}
                        onClick={handleSendCode}
                        type="button"
                        variant="outline"
                      >
                        {countdown > 0
                          ? MESSAGES.FORM.RESEND_CODE(countdown)
                          : sendingCode
                            ? MESSAGES.FORM.SENDING_CODE
                            : MESSAGES.FORM.SEND_CODE}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">新密码</Label>
                    <Input
                      id="password"
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="请输入新密码"
                      required
                      type="password"
                      value={formData.password}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password_confirm">{MESSAGES.FORM.PASSWORD_CONFIRM}</Label>
                    <Input
                      id="password_confirm"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          password_confirm: e.target.value,
                        })
                      }
                      placeholder={MESSAGES.FORM.PLACEHOLDER.PASSWORD_CONFIRM}
                      required
                      type="password"
                      value={formData.password_confirm}
                    />
                  </div>
                </>
              ) : isLogin ? (
                <>
                  {useCodeLogin ? (
                    <>
                      {/* 验证码登录 */}
                      <div className="space-y-2">
                        <Label htmlFor="account">{MESSAGES.FORM.ACCOUNT}</Label>
                        <Input
                          id="account"
                          onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                          placeholder={MESSAGES.FORM.PLACEHOLDER.ACCOUNT}
                          required
                          type="text"
                          value={formData.account}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="code">{MESSAGES.FORM.CODE}</Label>
                        <div className="flex gap-2">
                          <Input
                            className="flex-1"
                            id="code"
                            inputMode="numeric"
                            maxLength={4}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                              setFormData({ ...formData, code: value });
                            }}
                            placeholder={MESSAGES.FORM.PLACEHOLDER.CODE}
                            required
                            type="text"
                            value={formData.code}
                          />
                          <Button
                            className="whitespace-nowrap"
                            disabled={sendingCode || countdown > 0 || !formData.account}
                            onClick={handleSendCode}
                            type="button"
                            variant="outline"
                          >
                            {countdown > 0
                              ? MESSAGES.FORM.RESEND_CODE(countdown)
                              : sendingCode
                                ? MESSAGES.FORM.SENDING_CODE
                                : MESSAGES.FORM.SEND_CODE}
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* 账号密码登录 */}
                      <div className="space-y-2">
                        <Label htmlFor="account">{MESSAGES.FORM.ACCOUNT}</Label>
                        <Input
                          id="account"
                          onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                          placeholder={MESSAGES.FORM.PLACEHOLDER.ACCOUNT}
                          required
                          type="text"
                          value={formData.account}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">{MESSAGES.FORM.PASSWORD}</Label>
                        <Input
                          id="password"
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder={MESSAGES.FORM.PLACEHOLDER.PASSWORD}
                          required
                          type="password"
                          value={formData.password}
                        />
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email">{MESSAGES.FORM.EMAIL}</Label>
                    <Input
                      id="email"
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder={MESSAGES.FORM.PLACEHOLDER.EMAIL}
                      required
                      type="email"
                      value={formData.email}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="code">{MESSAGES.FORM.CODE}</Label>
                    <div className="flex gap-2">
                      <Input
                        className="flex-1"
                        id="code"
                        inputMode="numeric"
                        maxLength={4}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                          setFormData({ ...formData, code: value });
                        }}
                        placeholder={MESSAGES.FORM.PLACEHOLDER.CODE}
                        required
                        type="text"
                        value={formData.code}
                      />
                      <Button
                        className="whitespace-nowrap"
                        disabled={sendingCode || countdown > 0 || !formData.email}
                        onClick={handleSendCode}
                        type="button"
                        variant="outline"
                      >
                        {countdown > 0
                          ? MESSAGES.FORM.RESEND_CODE(countdown)
                          : sendingCode
                            ? MESSAGES.FORM.SENDING_CODE
                            : MESSAGES.FORM.SEND_CODE}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">{MESSAGES.FORM.PASSWORD}</Label>
                    <Input
                      id="password"
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder={MESSAGES.FORM.PLACEHOLDER.PASSWORD}
                      required
                      type="password"
                      value={formData.password}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password_confirm">{MESSAGES.FORM.PASSWORD_CONFIRM}</Label>
                    <Input
                      id="password_confirm"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          password_confirm: e.target.value,
                        })
                      }
                      placeholder={MESSAGES.FORM.PLACEHOLDER.PASSWORD_CONFIRM}
                      required
                      type="password"
                      value={formData.password_confirm}
                    />
                  </div>
                </>
              )}

              {error && (
                <div className="text-destructive text-sm">
                  {error.message || MESSAGES.ERROR.OPERATION_FAILED}
                </div>
              )}

              {(!isLogin || isResetPassword) &&
                formData.password &&
                formData.password_confirm &&
                formData.password !== formData.password_confirm && (
                  <div className="text-destructive text-sm">{MESSAGES.ERROR.PASSWORD_MISMATCH}</div>
                )}

              <Button className="w-full" disabled={currentMutation.isPending} type="submit">
                {currentMutation.isPending
                  ? MESSAGES.FORM.PROCESSING
                  : isResetPassword
                    ? "重置密码"
                    : isLogin
                      ? MESSAGES.FORM.LOGIN
                      : MESSAGES.FORM.REGISTER}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="qrcode">
            <div className="flex flex-col items-center justify-center space-y-4 py-6">
              <p className="text-sm text-muted-foreground">{MESSAGES.QRCODE_LOGIN.SCAN_TIP}</p>

              <div
                className="relative w-[300px] h-[300px] border border-border rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-colors"
                onClick={() => {
                  if (!qrLoading && qrStatus !== "success") {
                    refreshQRCode();
                  }
                }}
                title="点击刷新二维码"
              >
                {qrLoading || !qrImageUrl ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : (
                  <>
                    <img
                      alt="登录二维码"
                      className="w-full h-full object-contain"
                      src={qrImageUrl}
                    />

                    {/* 状态遮罩层 */}
                    {qrStatus !== "pending" && (
                      <QRCodeOverlay onRefresh={refreshQRCode} status={qrStatus} />
                    )}
                  </>
                )}
              </div>

              {qrError && <p className="text-sm text-destructive">{qrError}</p>}

              {!qrLoading && qrStatus === "pending" && (
                <p className="text-xs text-muted-foreground">点击二维码可刷新</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="account" className="mt-0">
            <div className="text-center space-y-2">
              {isResetPassword ? (
                <Button
                  className="text-sm"
                  onClick={() => {
                    setIsResetPassword(false);
                    setFormData({
                      account: "",
                      password: "",
                      password_confirm: "",
                      email: "",
                      code: "",
                    });
                  }}
                  type="button"
                  variant="link"
                >
                  返回登录
                </Button>
              ) : (
                <>
                  {isLogin && (
                    <div className="flex justify-center gap-4">
                      <Button
                        className="text-sm"
                        onClick={() => setUseCodeLogin(!useCodeLogin)}
                        type="button"
                        variant="link"
                      >
                        {useCodeLogin ? "使用账号密码登录" : "使用验证码登录"}
                      </Button>
                      <Button
                        className="text-sm"
                        onClick={() => setIsResetPassword(true)}
                        type="button"
                        variant="link"
                      >
                        忘记密码？
                      </Button>
                    </div>
                  )}
                  <div>
                    <Button
                      className="text-sm"
                      onClick={() => {
                        setIsLogin(!isLogin);
                        setUseCodeLogin(false); // 切换到注册时重置验证码登录状态
                      }}
                      type="button"
                      variant="link"
                    >
                      {isLogin
                        ? MESSAGES.BUTTON.NO_ACCOUNT_REGISTER
                        : MESSAGES.BUTTON.HAS_ACCOUNT_LOGIN}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
