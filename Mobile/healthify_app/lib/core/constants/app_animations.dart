abstract final class AppAnimations {
  // Durations
  static const Duration veryFast = Duration(milliseconds: 150);
  static const Duration fast = Duration(milliseconds: 250);
  static const Duration medium = Duration(milliseconds: 400);
  static const Duration slow = Duration(milliseconds: 600);
  static const Duration verySlow = Duration(milliseconds: 800);

  // Curves
  static const Curve ease = Curves.ease;
  static const Curve easeIn = Curves.easeIn;
  static const Curve easeOut = Curves.easeOut;
  static const Curve easeInOut = Curves.easeInOut;
  static const Curve smooth = Curves.easeInOutCubic;
  static const Curve bounce = Curves.easeOutBack;

  // Delays
  static const Duration stagger100 = Duration(milliseconds: 100);
  static const Duration stagger200 = Duration(milliseconds: 200);
  static const Duration stagger300 = Duration(milliseconds: 300);
  static const Duration stagger400 = Duration(milliseconds: 400);
}