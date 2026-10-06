import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

class AppTypography {
  static TextStyle get displayLarge => GoogleFonts.anuphan(
        fontSize: 32,
        fontWeight: FontWeight.w700,
        color: AppColors.textMain,
        letterSpacing: -0.5,
        height: 1.25,
      );

  static TextStyle get titleLarge => GoogleFonts.anuphan(
        fontSize: 22,
        fontWeight: FontWeight.w700,
        color: AppColors.textMain,
        height: 1.3,
      );

  static TextStyle get titleMedium => GoogleFonts.anuphan(
        fontSize: 18,
        fontWeight: FontWeight.w600,
        color: AppColors.textMain,
        height: 1.35,
      );

  static TextStyle get bodyLarge => GoogleFonts.anuphan(
        fontSize: 16,
        fontWeight: FontWeight.w400,
        color: AppColors.textMain,
        height: 1.5,
      );

  static TextStyle get bodyMedium => GoogleFonts.anuphan(
        fontSize: 14,
        fontWeight: FontWeight.w400,
        color: AppColors.textMuted,
        height: 1.45,
      );

  static TextStyle get labelLarge => GoogleFonts.anuphan(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        color: AppColors.textMain,
        letterSpacing: 0.1,
      );

  static TextStyle get labelSmall => GoogleFonts.anuphan(
        fontSize: 11,
        fontWeight: FontWeight.w600,
        color: AppColors.textMuted,
        letterSpacing: 0.2,
      );
}
