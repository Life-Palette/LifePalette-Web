import { useForm } from "@tanstack/react-form";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import AvatarUpload from "@/components/media/AvatarUpload";
import BackgroundUpload from "@/components/media/BackgroundUpload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { MESSAGES } from "@/constants/messages";
import { PROFILE_VALIDATION } from "@/constants/validation";
import { useSendEmailCode } from "@/hooks/useAuth";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import type { ApiUser } from "@/services/api";
import { getUserAvatar } from "@/utils/avatar";

interface ProfileEditDialogProps {
  user: ApiUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// Zod schema for validation
const profileSchema = z.object({
  name: z
    .string()
    .min(1, "昵称不能为空")
    .max(
      PROFILE_VALIDATION.NAME.MAX_LENGTH,
      `昵称不能超过${PROFILE_VALIDATION.NAME.MAX_LENGTH}个字符`,
    ),
  signature: z
    .string()
    .max(
      PROFILE_VALIDATION.SIGNATURE.MAX_LENGTH,
      `签名不能超过${PROFILE_VALIDATION.SIGNATURE.MAX_LENGTH}个字符`,
    )
    .optional(),
  email: z.string().email("请输入有效的邮箱地址").optional().or(z.literal("")),
  mobile: z.string().optional(),
  city: z.string().optional(),
  job: z.string().optional(),
  company: z.string().optional(),
  website: z.string().url("请输入有效的网址").optional().or(z.literal("")),
  github: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfileEditDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: ProfileEditDialogProps) {
  const updateProfile = useUpdateProfile();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const form = useForm({
    defaultValues: {
      name: user.name || "",
      signature: user.signature || "",
      email: user.email || "",
      mobile: user.mobile || "",
      city: user.city || "",
      job: user.job || "",
      company: user.company || "",
      website: user.website || "",
      github: user.github || "",
    },
    onSubmit: async ({ value }) => {
      try {
        // Only send changed values
        const updates: any = {};
        if (value.name !== user.name) updates.name = value.name;
        if (value.signature !== (user.signature || "")) updates.signature = value.signature;
        if (value.mobile !== (user.mobile || "")) updates.mobile = value.mobile;
        if (value.city !== (user.city || "")) updates.city = value.city;
        if (value.job !== (user.job || "")) updates.job = value.job;
        if (value.company !== (user.company || "")) updates.company = value.company;
        if (value.website !== (user.website || "")) updates.website = value.website;
        if (value.github !== (user.github || "")) updates.github = value.github;

        // 邮箱更改需要验证码
        const emailChanged = value.email !== (user.email || "") && value.email !== "";
        if (emailChanged) {
          if (!emailCode) {
            toast.error("更改邮箱需要验证码");
            return;
          }
          updates.email = value.email;
          updates.code = emailCode;
        }

        // Add file uploads if any
        if (avatarFile) updates.avatarFile = avatarFile;
        if (backgroundFile) updates.backgroundFile = backgroundFile;

        await updateProfile.mutateAsync(updates);

        toast.success("保存成功", {
          description: "个人资料已更新",
        });

        onOpenChange(false);
        onSuccess?.();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "操作失败，请稍后重试";
        toast.error("保存失败", {
          description: errorMessage,
        });
      }
    },
  });

  // File upload states (outside of form)
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | undefined>();
  const [backgroundError, setBackgroundError] = useState<string | undefined>();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // 邮箱验证码相关状态
  const [emailCode, setEmailCode] = useState("");
  const [emailCountdown, setEmailCountdown] = useState(0);
  const sendEmailCodeMutation = useSendEmailCode();

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset();
      setAvatarFile(null);
      setAvatarPreview(null);
      setBackgroundFile(null);
      setBackgroundPreview(null);
      setAvatarError(undefined);
      setBackgroundError(undefined);
      setEmailCode("");
      setEmailCountdown(0);
    }
  }, [open, user]);

  // 发送邮箱验证码
  const handleSendEmailCode = async () => {
    const email = form.getFieldValue("email");
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
      const result = await sendEmailCodeMutation.mutateAsync(email);
      if (result.code === 200) {
        toast.success(MESSAGES.EMAIL_BIND.CODE_SENT);
        // 开始倒计时
        setEmailCountdown(60);
        const timer = setInterval(() => {
          setEmailCountdown((prev) => {
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

  // Check if form has changes
  const hasChanges = () => {
    const isDirty = form.state.isDirty;
    return isDirty || avatarFile !== null || backgroundFile !== null;
  };

  const handleCancel = () => {
    if (hasChanges()) {
      setShowCancelConfirm(true);
    } else {
      onOpenChange(false);
    }
  };

  const handleConfirmCancel = () => {
    onOpenChange(false);
    setShowCancelConfirm(false);
  };

  const formContent = (
    <div className="max-h-[65vh] space-y-8 overflow-y-auto py-6 pr-2">
      {/* Avatar Upload */}
      <Card className="border-border/50">
        <CardContent className="flex justify-center pt-6">
          <AvatarUpload
            currentAvatar={getUserAvatar(user)}
            error={avatarError}
            onAvatarChange={(file, preview) => {
              setAvatarFile(file);
              setAvatarPreview(preview);
            }}
            onError={setAvatarError}
            previewAvatar={avatarPreview}
          />
        </CardContent>
      </Card>

      {/* Background Upload */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="h-6 px-2">
            背景图片
          </Badge>
        </div>
        <BackgroundUpload
          currentBackground={user.backgroundInfo?.url}
          error={backgroundError}
          onBackgroundChange={(file, preview) => {
            setBackgroundFile(file);
            setBackgroundPreview(preview);
          }}
          onError={setBackgroundError}
          onRemove={() => {
            setBackgroundFile(null);
            setBackgroundPreview(null);
          }}
          previewBackground={backgroundPreview}
        />
      </div>

      <Separator />

      {/* Basic Information */}
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="h-6 px-2">
            基本信息
          </Badge>
        </div>
        <FieldGroup className="grid gap-6 md:grid-cols-2">
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) => {
                const result = profileSchema.shape.name.safeParse(value);
                return result.success ? undefined : result.error.issues[0].message;
              },
            }}
          >
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    昵称 <span className="text-red-500">*</span>
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="请输入昵称"
                    maxLength={20}
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="email">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              const emailHasChanged =
                field.state.value !== (user.email || "") && field.state.value !== "";
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>邮箱</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      // 邮箱变化时清空验证码
                      if (e.target.value !== (user.email || "")) {
                        setEmailCode("");
                      }
                    }}
                    placeholder="example@email.com"
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  {emailHasChanged && (
                    <div className="mt-3 p-3 rounded-lg bg-muted/50 border border-border/50 space-y-3">
                      <p className="text-xs text-muted-foreground">
                        更改邮箱需要验证码校验，用于与微信小程序互通关联
                      </p>
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <FieldLabel htmlFor="email-code" className="text-xs">
                            {MESSAGES.FORM.CODE}
                          </FieldLabel>
                          <Input
                            id="email-code"
                            type="text"
                            inputMode="numeric"
                            maxLength={4}
                            placeholder={MESSAGES.EMAIL_BIND.PLACEHOLDER_CODE}
                            value={emailCode}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                              setEmailCode(value);
                            }}
                            className="mt-1"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleSendEmailCode}
                          disabled={sendEmailCodeMutation.isPending || emailCountdown > 0}
                          className="whitespace-nowrap h-9"
                        >
                          {emailCountdown > 0
                            ? MESSAGES.FORM.RESEND_CODE(emailCountdown)
                            : sendEmailCodeMutation.isPending
                              ? MESSAGES.FORM.SENDING_CODE
                              : MESSAGES.FORM.SEND_CODE}
                        </Button>
                      </div>
                    </div>
                  )}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="mobile">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>手机号</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="tel"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="请输入手机号"
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="city">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>城市</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="请输入城市"
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field
            name="signature"
            validators={{
              onChange: ({ value }) => {
                const result = profileSchema.shape.signature.safeParse(value);
                return result.success ? undefined : result.error.issues[0].message;
              },
            }}
          >
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid} className="md:col-span-2">
                  <FieldLabel htmlFor={field.name}>个性签名</FieldLabel>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="记录生活中的美好时光 ✨"
                    maxLength={100}
                    className="min-h-[80px] resize-none"
                    aria-invalid={isInvalid}
                  />
                  <FieldDescription className="text-right tabular-nums">
                    {field.state.value.length}/100
                  </FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
        </FieldGroup>
      </div>

      <Separator />

      {/* Professional Information */}
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="h-6 px-2">
            职业信息
          </Badge>
        </div>
        <FieldGroup className="grid gap-6 md:grid-cols-2">
          <form.Field name="job">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>职业</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="请输入职业"
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="company">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>公司</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="请输入公司"
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
        </FieldGroup>
      </div>

      <Separator />

      {/* Social Information */}
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="h-6 px-2">
            社交信息
          </Badge>
        </div>
        <FieldGroup className="grid gap-6 md:grid-cols-2">
          <form.Field name="website">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>个人网站</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="url"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="https://example.com"
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="github">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>GitHub</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="请输入 GitHub 用户名"
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
        </FieldGroup>
      </div>
    </div>
  );

  const footerButtons = (
    <>
      <Button
        className="h-11 flex-1 md:flex-none md:min-w-[120px]"
        disabled={updateProfile.isPending}
        onClick={handleCancel}
        type="button"
        variant="outline"
      >
        取消
      </Button>
      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting, state.isDirty]}>
        {([canSubmit, isSubmitting, isDirty]) => (
          <Button
            className="h-11 flex-1 md:flex-none md:min-w-[120px]"
            disabled={!canSubmit || (!isDirty && avatarFile === null && backgroundFile === null)}
            onClick={form.handleSubmit}
            type="button"
          >
            {isSubmitting ? "保存中..." : "保存"}
          </Button>
        )}
      </form.Subscribe>
      <ConfirmDialog
        confirmText="放弃"
        description="您的修改将不会被保存"
        onConfirm={handleConfirmCancel}
        onOpenChange={setShowCancelConfirm}
        open={showCancelConfirm}
        title="确定要放弃修改吗？"
        variant="destructive"
      />
    </>
  );

  if (isDesktop) {
    return (
      <Dialog onOpenChange={onOpenChange} open={open}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">编辑个人资料</DialogTitle>
          </DialogHeader>
          {formContent}
          <DialogFooter className="gap-2">{footerButtons}</DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="h-[95vh] w-full" side="bottom">
        <SheetHeader>
          <SheetTitle className="text-xl">编辑个人资料</SheetTitle>
        </SheetHeader>
        {formContent}
        <SheetFooter className="gap-2 pt-4">{footerButtons}</SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
