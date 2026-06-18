"""
Test script for the Nutrition API.
Run after starting the API server.
"""

import requests
import json

BASE_URL = "http://localhost:8000"


def test_health():
    """Test API health endpoint."""
    print("="*60)
    print("TEST 1: Health Check")
    print("="*60)
    r = requests.get(f"{BASE_URL}/")
    print(f"Status: {r.status_code}")
    print(json.dumps(r.json(), indent=2))


def test_diseases():
    """Test diseases endpoint."""
    print("\n" + "="*60)
    print("TEST 2: List Diseases")
    print("="*60)
    r = requests.get(f"{BASE_URL}/diseases")
    print(f"Status: {r.status_code}")
    print(json.dumps(r.json(), indent=2))


def test_goals():
    """Test goals endpoint."""
    print("\n" + "="*60)
    print("TEST 3: List Goals")
    print("="*60)
    r = requests.get(f"{BASE_URL}/goals")
    print(f"Status: {r.status_code}")
    print(json.dumps(r.json(), indent=2))


def test_predict_manual_healthy():
    """Test manual prediction for a healthy person."""
    print("\n" + "="*60)
    print("TEST 4: Predict - Healthy Male, Lose Fat")
    print("="*60)
    
    payload = {
        "inbody": {
            "height": 1.75,
            "weight": 80.0,
            "age": 30,
            "gender": "Male",
            "muscle_mass": 35.0,
            "body_fat_percentage": 22.5,
            "visceral_fat_level": 6,
            "waist_hip_ratio": 0.85,
            "trunk_fat_mass": 12.0,
            "trunk_lean_mass": 28.0,
            "inbody_score": 75
        },
        "user": {
            "goal": "lose_fat",
            "activity_level": 3,
            "fitness_level": 2,
            "disease_condition": "healthy"
        }
    }
    
    r = requests.post(f"{BASE_URL}/predict_manual", json=payload)
    print(f"Status: {r.status_code}")
    result = r.json()
    print(json.dumps(result, indent=2))


def test_predict_manual_diabetic():
    """Test manual prediction for a diabetic person."""
    print("\n" + "="*60)
    print("TEST 5: Predict - Female Diabetic, Maintain")
    print("="*60)
    
    payload = {
        "inbody": {
            "height": 1.60,
            "weight": 85.0,
            "age": 55,
            "gender": "Female",
            "muscle_mass": 28.0,
            "body_fat_percentage": 38.0,
            "visceral_fat_level": 12,
            "waist_hip_ratio": 0.92,
            "trunk_fat_mass": 18.0,
            "trunk_lean_mass": 22.0,
            "inbody_score": 55
        },
        "user": {
            "goal": "lose_fat",
            "activity_level": 2,
            "fitness_level": 1,
            "disease_condition": "diabetes_type2"
        }
    }
    
    r = requests.post(f"{BASE_URL}/predict_manual", json=payload)
    print(f"Status: {r.status_code}")
    result = r.json()
    print(json.dumps(result, indent=2))


def test_predict_manual_kidney():
    """Test manual prediction for kidney disease (low protein)."""
    print("\n" + "="*60)
    print("TEST 6: Predict - Kidney Disease, Maintain")
    print("="*60)
    
    payload = {
        "inbody": {
            "height": 1.70,
            "weight": 70.0,
            "age": 60,
            "gender": "Male",
            "muscle_mass": 25.0,
            "body_fat_percentage": 28.0,
            "visceral_fat_level": 8,
            "waist_hip_ratio": 0.88,
            "trunk_fat_mass": 14.0,
            "trunk_lean_mass": 23.0,
            "inbody_score": 65
        },
        "user": {
            "goal": "maintain",
            "activity_level": 2,
            "fitness_level": 1,
            "disease_condition": "kidney_disease"
        }
    }
    
    r = requests.post(f"{BASE_URL}/predict_manual", json=payload)
    print(f"Status: {r.status_code}")
    result = r.json()
    print(json.dumps(result, indent=2))


def test_predict_manual_underweight():
    """Test manual prediction for underweight person gaining muscle."""
    print("\n" + "="*60)
    print("TEST 7: Predict - Underweight, Gain Muscle")
    print("="*60)
    
    payload = {
        "inbody": {
            "height": 1.80,
            "weight": 55.0,
            "age": 22,
            "gender": "Male",
            "muscle_mass": 22.0,
            "body_fat_percentage": 8.0,
            "visceral_fat_level": 2,
            "waist_hip_ratio": 0.75,
            "trunk_fat_mass": 3.0,
            "trunk_lean_mass": 24.0,
            "inbody_score": 90
        },
        "user": {
            "goal": "gain_muscle",
            "activity_level": 4,
            "fitness_level": 3,
            "disease_condition": "underweight"
        }
    }
    
    r = requests.post(f"{BASE_URL}/predict_manual", json=payload)
    print(f"Status: {r.status_code}")
    result = r.json()
    print(json.dumps(result, indent=2))


def test_invalid_goal():
    """Test validation - invalid goal."""
    print("\n" + "="*60)
    print("TEST 8: Invalid Goal (should return 400)")
    print("="*60)
    
    payload = {
        "inbody": {
            "height": 1.75, "weight": 80, "age": 30, "gender": "Male",
            "muscle_mass": 35, "body_fat_percentage": 22.5,
            "visceral_fat_level": 6, "waist_hip_ratio": 0.85,
            "trunk_fat_mass": 12, "trunk_lean_mass": 28, "inbody_score": 75
        },
        "user": {
            "goal": "invalid_goal",
            "activity_level": 3,
            "disease_condition": "healthy"
        }
    }
    
    r = requests.post(f"{BASE_URL}/predict_manual", json=payload)
    print(f"Status: {r.status_code}")
    print(r.json())


if __name__ == "__main__":
    print("\n🔬 Nutrition API Test Suite\n")
    
    try:
        test_health()
        test_diseases()
        test_goals()
        test_predict_manual_healthy()
        test_predict_manual_diabetic()
        test_predict_manual_kidney()
        test_predict_manual_underweight()
        test_invalid_goal()
        
        print("\n" + "="*60)
        print("ALL TESTS COMPLETE!")
        print("="*60)
    except requests.exceptions.ConnectionError:
        print("❌ API not running! Start it first:")
        print("   cd nutrition_project && python app.py")
