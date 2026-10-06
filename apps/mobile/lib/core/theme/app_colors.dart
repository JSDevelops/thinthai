import 'package:flutter/material.dart';

/// Palette สีหลักประจำอัตลักษณ์ ThinThai (เที่ยวไทยให้ถึงถิ่น)
class AppColors {
  // Primary (เขียวมรกตธรรมชาติ / เขียวนกยูง)
  static const Color primary = Color(0xFF00695C);
  static const Color primaryDark = Color(0xFF123F37);
  static const Color primaryLight = Color(0xFF3B9B8E);
  static const Color primaryContainer = Color(0xFFD6F2EB);

  // Accent & Gold (ส้มดินเผา & ทองอร่าม)
  static const Color accent = Color(0xFFD37827);
  static const Color accentLight = Color(0xFFECA366);
  static const Color gold = Color(0xFFFFC578);
  static const Color goldDark = Color(0xFFC78B38);

  // Backgrounds & Surfaces (อบอุ่น นุ่มนวล เสมือนกระดาษสาและผ้าฝ้าย)
  static const Color background = Color(0xFFF6F7F3);
  static const Color surface = Color(0xFFFFF9F1);
  static const Color surfaceCard = Color(0xFFFFFFFF);
  static const Color surfaceTinted = Color(0xFFF0F5F2);

  // Typography & Content
  static const Color textMain = Color(0xFF173832);
  static const Color textMuted = Color(0xFF556A62);
  static const Color textLight = Color(0xFF8B9E97);
  static const Color textOnPrimary = Colors.white;

  // Borders, Dividers & Shadows
  static const Color border = Color(0xFFE2E7DF);
  static const Color borderLight = Color(0xFFECEFEA);
  static const Color shadow = Color(0x14000000);
  static const Color shadowDeep = Color(0x24123F37);

  // Status & Badges
  static const Color success = Color(0xFF2E7D32);
  static const Color warning = Color(0xFFF57C00);
  static const Color error = Color(0xFFD32F2F);
  static const Color star = Color(0xFFFFB300);
}
