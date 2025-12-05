import { Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MESSAGES } from "@/constants/messages";
import { useSendEmailCode, useUpdateUserEmail } from "@/hooks/useAuth";

interface BindEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: number;
}

export default function BindEmailModal({
  isOpen,
  onClose,
  onSuccess,
  userId,
}: BindEmailModalProps) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [countdown, setCountdown] = useState(0);

  const sendCodeMutation = useSendEmailCode();
  const updateEmailMutation = useUpdateUserEmail();

  // 发送验证码
  const handleSendCode = async () => {
    if (!email) {
      toast.error("请先输入邮箱地址");
      return;
    }

    // 简单的邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("请输入正确的邮箱格式");
      return;
    }

    try {
      const result = await sendCodeMutation.mutateAsync(email);
      if (result.code === 200) {
        toast.success(MESSAGES.EMAIL_BIND.CODE_SENT);
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
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : MESSAGES.EMAIL_BIND.CODE_SEND_FAILED;
      toast.error(errorMessage);
    }
  };

  // 绑定邮箱
  const handleBindEmail = async () => {
    if (!email || !code) {
      toast.error("请填写邮箱和验证码");
      return;
    }

    try {
      const result = await updateEmailMutation.mutateAsync({
        userId,
        email,
        code,
      });

      if (result.code === 200) {
        toast.success(MESSAGES.EMAIL_BIND.BIND_SUCCESS);
        onSuccess();
        handleClose();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : MESSAGES.EMAIL_BIND.BIND_FAILED;
      toast.error(errorMessage);
    }
  };

  // 关闭弹窗并重置状态
  const handleClose = () => {
    setEmail("");
    setCode("");
    setCountdown(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            {MESSAGES.EMAIL_BIND.TITLE}
          </DialogTitle>
          <DialogDescription>{MESSAGES.EMAIL_BIND.DESCRIPTION}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="bind-email">{MESSAGES.FORM.EMAIL}</Label>
            <Input
              id="bind-email"
              type="email"
              placeholder={MESSAGES.EMAIL_BIND.PLACEHOLDER_EMAIL}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bind-code">{MESSAGES.FORM.CODE}</Label>
            <div className="flex gap-2">
              <Input
                id="bind-code"
                type="text"
                inputMode="numeric"
                maxLength={4}
                placeholder={MESSAGES.EMAIL_BIND.PLACEHOLDER_CODE}
                value={code}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setCode(value);
                }}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleSendCode}
                disabled={sendCodeMutation.isPending || countdown > 0 || !email}
                className="whitespace-nowrap"
              >
                {countdown > 0
                  ? MESSAGES.FORM.RESEND_CODE(countdown)
                  : sendCodeMutation.isPending
                    ? MESSAGES.FORM.SENDING_CODE
                    : MESSAGES.FORM.SEND_CODE}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button variant="ghost" onClick={handleClose}>
            {MESSAGES.EMAIL_BIND.LATER}
          </Button>
          <Button
            onClick={handleBindEmail}
            disabled={updateEmailMutation.isPending || !email || !code}
          >
            {updateEmailMutation.isPending
              ? MESSAGES.FORM.PROCESSING
              : MESSAGES.EMAIL_BIND.BIND_NOW}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
