import 'package:flutter_test/flutter_test.dart';
import 'package:healthify_app/healthyfy_app.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const HealthyfyApp());
    expect(find.byType(HealthyfyApp), findsOneWidget);
  });
}
