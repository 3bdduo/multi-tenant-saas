"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DoctorActivationBanner } from "@/components/DoctorActivationBanner";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { getMe, updateMe, deleteMyAccount } from "@/lib/api/doctor";
import { ApiError, clearTokens } from "@/lib/http";
import { validateEmail, validateEgyptianPhone } from "@/lib/validators";

export default function DoctorAccountSettingsPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Password fields
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);

  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getMe()
      .then((res) => {
        const doc = res.data;
        setFirstName(doc.firstName ?? "");
        setLastName(doc.lastName ?? "");
        setUserName(doc.userName ?? "");
        setEmail(doc.email ?? "");
        setPhoneNumber(doc.phoneNumber ?? "");
      })
      .catch((err) => {
        console.error("Failed to load doctor profile:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleUpdateProfile(e: FormEvent) {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(false);

    const emailErr = validateEmail(email);
    if (emailErr) {
      setProfileError(emailErr);
      return;
    }

    const phoneErr = validateEgyptianPhone(phoneNumber);
    if (phoneErr) {
      setProfileError(phoneErr);
      return;
    }

    setSavingProfile(true);
    try {
      await updateMe({
        firstName,
        lastName,
        userName,
        email,
        phoneNumber,
      });
      setProfileSuccess(true);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "تعذّر تحديث البيانات الشخصية";
      setProfileError(msg);
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleUpdatePassword(e: FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (!newPassword || newPassword.length < 6) {
      setPasswordError("كلمة المرور الجديدة يجب أن تتكون من 6 أحرف أو أرقام على الأقل");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("كلمة المرور الجديدة وتأكيدها غير متطابقين");
      return;
    }

    setSavingPassword(true);
    try {
      await updateMe({
        
        ...(oldPassword ? { oldPassword } : {}),
        password: newPassword,
      } as any);
      setPasswordSuccess(true);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "تعذّر تغيير كلمة المرور";
      setPasswordError(msg);
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      await deleteMyAccount();
      
      clearTokens();
      router.push("/login");
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "تعذّر حذف الحساب");
      setDeleting(false);
    }
  }

  if (loading) {
    return <div className="h-64 animate-pulse rounded-2xl bg-border/40" />;
  }

  return (
    <div className="flex flex-col gap-8 pb-12 animate-fade-in max-w-3xl mx-auto">
      <DoctorActivationBanner />

      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-extrabold text-text-primary md:text-3xl">
          بوابة الطبيب
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          إعدادات الحساب، البريد الإلكتروني، اسم المستخدم، وبيانات تسجيل الدخول في بوابة الطبيب
        </p>
      </div>

      {}
      <Card glass vibrant className="p-6 md:p-8 shadow-2xl">
        <h2 className="font-display text-lg font-bold text-text-primary mb-5 flex items-center gap-2 border-b border-border/50 pb-3">
          <span></span>
          <span>البيانات الشخصية وبيانات الحساب</span>
        </h2>

        <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="الاسم الأول *"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />

          <Field
            label="اسم العائلة / اللقب *"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />

          <Field
            label="اسم المستخدم (Username) *"
            required
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="مثال: dr_ahmed"
            className="sm:col-span-2"
          />

          <Field
            label="البريد الإلكتروني *"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@domain.com"
          />

          <Field
            label="رقم الهاتف المصري *"
            required
            inputMode="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="01000000000"
          />

          {profileError && (
            <div className="sm:col-span-2 rounded-xl bg-danger/10 border border-danger/20 p-3 text-xs font-bold text-danger animate-fade-in">
              {profileError}
            </div>
          )}

          {profileSuccess && (
            <div className="sm:col-span-2 rounded-xl bg-success/10 border border-success/20 p-3 text-xs font-bold text-success animate-fade-in">
              تم حفظ وتحديث بيانات الحساب بنجاح 
            </div>
          )}

          <Button
            type="submit"
            variant="vibrant"
            disabled={savingProfile}
            className="sm:col-span-2 font-bold shadow-glow-cyan"
          >
            {savingProfile ? "جارٍ حفظ البيانات..." : "حفظ التعديلات"}
          </Button>
        </form>
      </Card>

      {}
      <Card glass vibrant className="p-6 md:p-8 shadow-2xl">
        <h2 className="font-display text-lg font-bold text-text-primary mb-5 flex items-center gap-2 border-b border-border/50 pb-3">
          <span></span>
          <span>تغيير كلمة المرور (Password)</span>
        </h2>

        <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
          <Field
            label="كلمة المرور الحالية"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="أدخل كلمة المرور الحالية"
          />

          <Field
            label="كلمة المرور الجديدة *"
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="أدخل كلمة المرور الجديدة (6 أحرف أو أرقام على الأقل)"
          />

          <Field
            label="تأكيد كلمة المرور الجديدة *"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="أعد كتابة كلمة المرور الجديدة للتأكيد"
          />

          {passwordError && (
            <div className="rounded-xl bg-danger/10 border border-danger/20 p-3 text-xs font-bold text-danger animate-fade-in">
              {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div className="rounded-xl bg-success/10 border border-success/20 p-3 text-xs font-bold text-success animate-fade-in">
              تم تحديث كلمة المرور بنجاح 
            </div>
          )}

          <Button
            type="submit"
            variant="vibrant"
            disabled={savingPassword}
            className="font-bold shadow-glow-cyan"
          >
            {savingPassword ? "جارٍ تحديث كلمة المرور..." : "تحديث كلمة المرور"}
          </Button>
        </form>
      </Card>

      {}
      <Card className="p-6 md:p-8 border-danger/30 bg-danger/5 shadow-2xl">
        <h2 className="font-display text-lg font-bold text-danger mb-2">
          منطقة الخطر (حذف الحساب)
        </h2>
        <p className="text-sm text-text-secondary mb-4 leading-relaxed">
          حذف حسابك سيؤدي إلى مسح جميع بياناتك، عيادتك، مواعيدك، وسجلات المرضى المرتبطة بك نهائياً ولا يمكن التراجع عن هذا الإجراء.
        </p>
        <Button 
          variant="danger" 
          onClick={() => setShowDeleteModal(true)}
          className="font-bold border border-danger/50"
        >
          حذف الحساب نهائياً
        </Button>
      </Card>

      {}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="max-w-md w-full shadow-2xl border-danger/50 bg-surface">
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger/10 text-danger text-3xl font-black">
                !
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-text-primary">
                  هل أنت متأكد من حذف حسابك؟
                </h3>
                <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                  سيتم فقدان <strong>جميع البيانات</strong> الخاصة بالعيادة والمواعيد للأبد. هذا الإجراء نهائي ولا رجعة فيه.
                </p>
              </div>
              <div className="flex w-full gap-3 mt-4">
                <Button 
                  variant="danger" 
                  className="flex-1 font-bold" 
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                >
                  {deleting ? "جارٍ الحذف..." : "نعم، احذف حسابي"}
                </Button>
                <Button 
                  variant="secondary" 
                  className="flex-1 font-bold" 
                  onClick={() => setShowDeleteModal(false)}
                >
                  تراجع
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
