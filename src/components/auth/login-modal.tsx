/* biome-ignore-all lint/complexity/noExcessiveCognitiveComplexity: this existing integration requires the current implementation */
import { AlertCircle, CheckCircle, Smile } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MESSAGES } from "@/constants/messages";
import {
  useLogin,
  useLoginByCode,
  useRegister,
  useResetPassword,
  useSendEmailCode,
} from "@/hooks/use-auth";
import { useQRCodeLogin } from "@/hooks/use-qr-code-login";
import { cn } from "@/lib/utils";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface QRCodeOverlayProps {
  onRefresh: () => void;
  status: "confirm" | "timeout" | "success";
}

function getCodeButtonLabel(countdown: number, sendingCode: boolean) {
  if (countdown > 0) {
    return MESSAGES.FORM.RESEND_CODE(countdown);
  }
  if (sendingCode) {
    return MESSAGES.FORM.SENDING_CODE;
  }
  return MESSAGES.FORM.SEND_CODE;
}

function getSubmitLabel(
  isLogin: boolean,
  isResetPassword: boolean,
  isPending: boolean
) {
  if (isPending) {
    return MESSAGES.FORM.PROCESSING;
  }
  if (isResetPassword) {
    return "重置密码";
  }
  return isLogin ? MESSAGES.FORM.LOGIN : MESSAGES.FORM.REGISTER;
}

function getDialogTitle(isLogin: boolean, isResetPassword: boolean) {
  if (isResetPassword) {
    return "重置密码";
  }
  return isLogin ? MESSAGES.FORM.LOGIN : MESSAGES.FORM.REGISTER;
}

function QRCodeOverlay({ status, onRefresh }: QRCodeOverlayProps) {
  const overlayConfig = {
    confirm: {
      clickable: false,
      icon: <CheckCircle className="h-12 w-12 text-green-500" />,
      maskColor: "bg-white/80",
      text: null,
    },
    success: {
      clickable: false,
      icon: <Smile className="h-12 w-12 text-green-500" />,
      maskColor: "bg-white/80",
      text: null,
    },
    timeout: {
      clickable: true,
      icon: <AlertCircle className="h-12 w-12 text-red-500" />,
      maskColor: "bg-black/50",
      text: MESSAGES.QRCODE_LOGIN.REFRESH_TIP,
    },
  };

  const config = overlayConfig[status];

  return (
    <button
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center",
        config.clickable && "cursor-pointer"
      )}
      disabled={!config.clickable}
      onClick={onRefresh}
      type="button"
    >
      <div className={cn("absolute inset-0", config.maskColor)} />
      <div className="relative z-10 flex flex-col items-center space-y-2">
        {config.icon}
        {!!config.text && (
          <p className="font-medium text-sm text-white">{config.text}</p>
        )}
      </div>
    </button>
  );
}

export default function LoginModal({
  isOpen,
  onClose,
  onSuccess,
}: LoginModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loginMethod, setLoginMethod] = useState<"account" | "qrcode">(
    "account"
  );
  const [useCodeLogin, setUseCodeLogin] = useState(false); // 是否使用验证码登录
  const [isResetPassword, setIsResetPassword] = useState(false); // 是否重置密码
  const [formData, setFormData] = useState({
    account: "",
    code: "",
    email: "",
    password: "",
    password_confirm: "",
  });
  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const loginMutation = useLogin();
  const loginByCodeMutation = useLoginByCode();
  const registerMutation = useRegister();
  const resetPasswordMutation = useResetPassword();
  const sendEmailCodeMutation = useSendEmailCode();

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

    // 根据场景确定 purpose
    let purpose = "register";
    if (isResetPassword) {
      purpose = "reset_password";
    } else if (isLogin) {
      purpose = "login";
    }

    setSendingCode(true);
    try {
      const response = await sendEmailCodeMutation.mutateAsync({
        email: emailOrAccount,
        purpose,
      });

      if (response.code === 200) {
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
        toast.error(response.message || "发送验证码失败");
      }
    } catch (sendError) {
      console.error("发送验证码失败:", sendError);
      const errorMessage =
        sendError instanceof Error
          ? sendError.message
          : "发送验证码失败，请重试";
      toast.error(errorMessage);
    } finally {
      setSendingCode(false);
    }
  };

  const resetForm = () =>
    setFormData({
      account: "",
      code: "",
      email: "",
      password: "",
      password_confirm: "",
    });

  const handleResetSubmit = async () => {
    const result = await resetPasswordMutation.mutateAsync({ ...formData });
    if (result.code === 200) {
      toast.success("密码重置成功，请使用新密码登录");
      setIsResetPassword(false);
      resetForm();
    }
  };

  const handleLoginSubmit = async () => {
    const result = useCodeLogin
      ? await loginByCodeMutation.mutateAsync({
          account: formData.account,
          code: formData.code,
        })
      : await loginMutation.mutateAsync({
          account: formData.account,
          password: formData.password,
        });
    if (result.code === 200) {
      toast.success("登录成功");
      onSuccess();
      onClose();
      resetForm();
    }
  };

  const handleRegisterSubmit = async () => {
    const result = await registerMutation.mutateAsync({ ...formData });
    if (result.code === 200 || result.code === 201) {
      toast.success(
        result.result?.token?.access_token ? "注册成功，已自动登录" : "注册成功"
      );
      onSuccess();
      onClose();
      resetForm();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (
      (!isLogin || isResetPassword) &&
      formData.password !== formData.password_confirm
    ) {
      toast.error(MESSAGES.ERROR.PASSWORD_MISMATCH);
      return;
    }
    try {
      if (isResetPassword) {
        await handleResetSubmit();
      } else if (isLogin) {
        await handleLoginSubmit();
      } else {
        await handleRegisterSubmit();
      }
    } catch (caughtError) {
      const errorMessage =
        caughtError instanceof Error
          ? caughtError.message
          : MESSAGES.ERROR.OPERATION_FAILED;
      toast.error(errorMessage);
    }
  };

  let currentMutation = registerMutation;
  if (isResetPassword) {
    currentMutation = resetPasswordMutation;
  } else if (isLogin) {
    currentMutation = useCodeLogin ? loginByCodeMutation : loginMutation;
  }
  const { error } = currentMutation;

  const updateFormField = (field: keyof typeof formData, value: string) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
  };
  const handleAccountChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    updateFormField("account", event.target.value);
  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    updateFormField("email", event.target.value);
  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    updateFormField("password", event.target.value);
  const handlePasswordConfirmChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => updateFormField("password_confirm", event.target.value);
  const handleCodeChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    updateFormField("code", event.target.value.replace(/\D/g, "").slice(0, 6));
  const handleTabChange = (value: string) =>
    setLoginMethod(value as "account" | "qrcode");
  const handleQrRefresh = () => {
    if (!qrLoading && qrStatus !== "success") {
      refreshQRCode();
    }
  };
  const handleBackToLogin = () => {
    setIsResetPassword(false);
    setFormData({
      account: "",
      code: "",
      email: "",
      password: "",
      password_confirm: "",
    });
  };
  const handleToggleCodeLogin = () => setUseCodeLogin((previous) => !previous);
  const handleForgotPassword = () => setIsResetPassword(true);
  const handleToggleLogin = () => {
    setIsLogin((previous) => !previous);
    setUseCodeLogin(false);
  };

  return (
    <Dialog onOpenChange={onClose} open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getDialogTitle(isLogin, isResetPassword)}</DialogTitle>
        </DialogHeader>

        <Tabs
          defaultValue="account"
          onValueChange={handleTabChange}
          value={loginMethod}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="account">
              {MESSAGES.QRCODE_LOGIN.TAB_ACCOUNT}
            </TabsTrigger>
            <TabsTrigger value="qrcode">
              {MESSAGES.QRCODE_LOGIN.TAB_QRCODE}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <form className="space-y-4" onSubmit={handleSubmit}>
              {!!isResetPassword && (
                <>
                  {/* 重置密码表单 */}
                  <div className="space-y-2">
                    <Label htmlFor="account">邮箱</Label>
                    <Input
                      id="account"
                      onChange={handleAccountChange}
                      placeholder="请输入邮箱"
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
                        maxLength={6}
                        onChange={handleCodeChange}
                        placeholder={MESSAGES.FORM.PLACEHOLDER.CODE}
                        required
                        type="text"
                        value={formData.code}
                      />
                      <Button
                        className="whitespace-nowrap"
                        disabled={
                          sendingCode || countdown > 0 || !formData.account
                        }
                        onClick={handleSendCode}
                        type="button"
                        variant="outline"
                      >
                        {getCodeButtonLabel(countdown, sendingCode)}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">新密码</Label>
                    <Input
                      id="password"
                      onChange={handlePasswordChange}
                      placeholder="请输入新密码"
                      required
                      type="password"
                      value={formData.password}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password_confirm">
                      {MESSAGES.FORM.PASSWORD_CONFIRM}
                    </Label>
                    <Input
                      id="password_confirm"
                      onChange={handlePasswordConfirmChange}
                      placeholder={MESSAGES.FORM.PLACEHOLDER.PASSWORD_CONFIRM}
                      required
                      type="password"
                      value={formData.password_confirm}
                    />
                  </div>
                </>
              )}
              {!!isLogin && !!useCodeLogin && (
                <>
                  {/* 验证码登录 */}
                  <div className="space-y-2">
                    <Label htmlFor="account">{MESSAGES.FORM.ACCOUNT}</Label>
                    <Input
                      id="account"
                      onChange={handleAccountChange}
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
                        maxLength={6}
                        onChange={handleCodeChange}
                        placeholder={MESSAGES.FORM.PLACEHOLDER.CODE}
                        required
                        type="text"
                        value={formData.code}
                      />
                      <Button
                        className="whitespace-nowrap"
                        disabled={
                          sendingCode || countdown > 0 || !formData.account
                        }
                        onClick={handleSendCode}
                        type="button"
                        variant="outline"
                      >
                        {getCodeButtonLabel(countdown, sendingCode)}
                      </Button>
                    </div>
                  </div>
                </>
              )}
              {isLogin && !useCodeLogin && (
                <>
                  {/* 账号密码登录 */}
                  <div className="space-y-2">
                    <Label htmlFor="account">{MESSAGES.FORM.ACCOUNT}</Label>
                    <Input
                      id="account"
                      onChange={handleAccountChange}
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
                      onChange={handlePasswordChange}
                      placeholder={MESSAGES.FORM.PLACEHOLDER.PASSWORD}
                      required
                      type="password"
                      value={formData.password}
                    />
                  </div>
                </>
              )}
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email">{MESSAGES.FORM.EMAIL}</Label>
                    <Input
                      id="email"
                      onChange={handleEmailChange}
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
                        maxLength={6}
                        onChange={handleCodeChange}
                        placeholder={MESSAGES.FORM.PLACEHOLDER.CODE}
                        required
                        type="text"
                        value={formData.code}
                      />
                      <Button
                        className="whitespace-nowrap"
                        disabled={
                          sendingCode || countdown > 0 || !formData.email
                        }
                        onClick={handleSendCode}
                        type="button"
                        variant="outline"
                      >
                        {getCodeButtonLabel(countdown, sendingCode)}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">{MESSAGES.FORM.PASSWORD}</Label>
                    <Input
                      id="password"
                      onChange={handlePasswordChange}
                      placeholder={MESSAGES.FORM.PLACEHOLDER.PASSWORD}
                      required
                      type="password"
                      value={formData.password}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password_confirm">
                      {MESSAGES.FORM.PASSWORD_CONFIRM}
                    </Label>
                    <Input
                      id="password_confirm"
                      onChange={handlePasswordConfirmChange}
                      placeholder={MESSAGES.FORM.PLACEHOLDER.PASSWORD_CONFIRM}
                      required
                      type="password"
                      value={formData.password_confirm}
                    />
                  </div>
                </>
              )}

              {!!error && (
                <div className="text-destructive text-sm">
                  {error.message || MESSAGES.ERROR.OPERATION_FAILED}
                </div>
              )}

              {(!isLogin || isResetPassword) &&
                formData.password &&
                formData.password_confirm &&
                formData.password !== formData.password_confirm && (
                  <div className="text-destructive text-sm">
                    {MESSAGES.ERROR.PASSWORD_MISMATCH}
                  </div>
                )}

              <Button
                className="w-full"
                disabled={currentMutation.isPending}
                type="submit"
              >
                {getSubmitLabel(
                  isLogin,
                  isResetPassword,
                  currentMutation.isPending
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="qrcode">
            <div className="flex flex-col items-center justify-center space-y-4 py-6">
              <p className="text-muted-foreground text-sm">
                {MESSAGES.QRCODE_LOGIN.SCAN_TIP}
              </p>

              <button
                className="relative h-[300px] w-[300px] cursor-pointer overflow-hidden rounded-lg border border-border transition-colors hover:border-primary"
                onClick={handleQrRefresh}
                title="点击刷新二维码"
                type="button"
              >
                {qrLoading || !qrImageUrl ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <div className="h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
                  </div>
                ) : (
                  <>
                    <img
                      alt="登录二维码"
                      className="h-full w-full object-contain"
                      height={200}
                      src={qrImageUrl}
                      width={200}
                    />

                    {/* 状态遮罩层 */}
                    {qrStatus !== "pending" && (
                      <QRCodeOverlay
                        onRefresh={refreshQRCode}
                        status={qrStatus}
                      />
                    )}
                  </>
                )}
              </button>

              {qrError ? (
                <p className="text-destructive text-sm">{qrError}</p>
              ) : null}

              {!qrLoading && qrStatus === "pending" && (
                <p className="text-muted-foreground text-xs">
                  点击二维码可刷新
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent className="mt-0" value="account">
            <div className="space-y-2 text-center">
              {isResetPassword ? (
                <Button
                  className="text-sm"
                  onClick={handleBackToLogin}
                  type="button"
                  variant="link"
                >
                  返回登录
                </Button>
              ) : (
                <>
                  {!!isLogin && (
                    <div className="flex justify-center gap-4">
                      <Button
                        className="text-sm"
                        onClick={handleToggleCodeLogin}
                        type="button"
                        variant="link"
                      >
                        {useCodeLogin ? "使用账号密码登录" : "使用验证码登录"}
                      </Button>
                      <Button
                        className="text-sm"
                        onClick={handleForgotPassword}
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
                      onClick={handleToggleLogin}
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
