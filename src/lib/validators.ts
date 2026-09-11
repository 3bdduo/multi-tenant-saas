
export function validateEgyptianNationalId(id: string): string | null {
  const clean = id.trim();
  if (!clean) return "الرقم القومي مطلوب";
  if (!/^\d+$/.test(clean)) return "الرقم القومي يجب أن يتكون من أرقام فقط";
  if (clean.length !== 14) return "الرقم القومي يجب أن يتكون من 14 رقمًا بالضبط";
  
  
  const firstDigit = clean[0];
  if (firstDigit !== "2" && firstDigit !== "3") {
    return "الرقم القومي غير صحيح (يجب أن يبدأ بـ 2 أو 3)";
  }

  
  const month = parseInt(clean.substring(3, 5), 10);
  const day = parseInt(clean.substring(5, 7), 10);
  if (month < 1 || month > 12) return "تاريخ الميلاد في الرقم القومي غير صحيح (الشهر غير صائب)";
  if (day < 1 || day > 31) return "تاريخ الميلاد في الرقم القومي غير صحيح (اليوم غير صائب)";

  
  const govCode = parseInt(clean.substring(7, 9), 10);
  const validGovs = [1, 2, 3, 4, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 24, 25, 26, 27, 28, 29, 31, 32, 33, 34, 35, 88];
  if (!validGovs.includes(govCode)) {
    return "رمز المحافظة في الرقم القومي غير صحيح";
  }

  return null;
}


export function validateEgyptianPhone(phone: string): string | null {
  const clean = phone.trim();
  if (!clean) return "رقم الهاتف مطلوب";
  
  
  const egyptPhoneRegex = /^(01[0125]\d{8}|\+?201[0125]\d{8})$/;
  if (!egyptPhoneRegex.test(clean)) {
    return "يرجى إدخال رقم هاتف مصري صحيح (مثال: 01000000000 أو 011/012/015)";
  }
  return null;
}


export function validateName(name: string, fieldLabel = "الاسم"): string | null {
  const clean = name.trim();
  if (!clean) return `${fieldLabel} مطلوب`;
  if (clean.length < 2) return `${fieldLabel} يجب أن يتكون من حرفين على الأقل`;
  if (clean.length > 30) return `${fieldLabel} يجب ألا يتجاوز 30 حرفًا`;
  if (!/^[\u0600-\u06FFa-zA-Z\s]+$/.test(clean)) {
    return `${fieldLabel} يجب أن يحتوي على حروف فقط بدون أرقام أو رموز`;
  }
  return null;
}

export function validateFourWordsName(name: string, fieldLabel = "الاسم"): string | null {
  const clean = name.trim();
  if (!clean) return `${fieldLabel} مطلوب`;
  if (!/^[\u0600-\u06FFa-zA-Z\s]+$/.test(clean)) {
    return `${fieldLabel} يجب أن يحتوي على حروف فقط بدون أرقام أو رموز`;
  }
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length < 4) {
    return `${fieldLabel} يجب أن يتكون من 4 كلمات على الأقل (رباعي)`;
  }
  return null;
}

// Email Validator
export function validateEmail(email: string): string | null {
  const clean = email.trim();
  if (!clean) return "البريد الإلكتروني مطلوب";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(clean)) {
    return "يرجى إدخال بريد إلكتروني صحيح (مثال: name@example.com)";
  }
  return null;
}

// Password Validator
export function validatePassword(password: string): string | null {
  if (!password) return "كلمة المرور مطلوبة";
  if (password.length < 6) return "كلمة المرور يجب أن لا تقل عن 6 أحرف أو أرقام";
  return null;
}

// Price Validator
export function validatePrice(price: number): string | null {
  if (price === undefined || price === null || isNaN(price)) return "سعر الكشف مطلوب";
  if (price <= 0) return "سعر الكشف يجب أن يكون رقمًا أكبر من صفر";
  return null;
}
