from pydantic import BaseModel, Field, field_validator


class PredictRequest(BaseModel):
    height: float               = Field(..., gt=0,  example=1.84,  description="Height in metres")
    weight: float               = Field(..., gt=0,  example=109.7, description="Weight in kg")
    age: int                    = Field(..., gt=0,  example=21,    description="Age in years")
    gender: str                 = Field(...,         example="Male")
    activity_level: int         = Field(..., ge=1, le=5, example=3, description="1=Sedentary  2=Light  3=Moderate  4=Active  5=Very Active")
    fitness_level: int          = Field(..., ge=1, le=3, example=1, description="1=Beginner  2=Intermediate  3=Advanced")
    goal: str                   = Field(..., example="lose_fat", description="lose_fat | maintain | gain_muscle")
    muscle_mass: float          = Field(..., ge=0,  example=36.2,  description="Muscle mass in kg")
    body_fat_percentage: float  = Field(..., ge=0,  example=41.5,  description="Body fat %")
    body_fat_mass: float        = Field(..., ge=0,  example=45.5,  description="Body fat mass in kg")
    water: float                = Field(..., ge=0,  example=46.9,  description="Body water in litres")
    protein_intake: float       = Field(..., ge=0,  example=11.86, description="Protein intake in g (InBody)")
    minerals: float             = Field(..., ge=0,  example=5.58,  description="Minerals in kg")
    bmi: float                  = Field(..., gt=0,  example=32.4,  description="Body Mass Index")

    @field_validator("gender")
    @classmethod
    def validate_gender(cls, v: str) -> str:
        allowed = {"Male", "Female", "Unknown"}
        if v not in allowed:
            raise ValueError(f"gender must be one of {sorted(allowed)}, got '{v}'")
        return v

    @field_validator("goal")
    @classmethod
    def validate_goal(cls, v: str) -> str:
        allowed = {"lose_fat", "maintain", "gain_muscle"}
        if v not in allowed:
            raise ValueError(f"goal must be one of {sorted(allowed)}, got '{v}'")
        return v


class PredictResponse(BaseModel):
    calories: float = Field(..., description="Recommended daily calories (kcal)")
    protein:  float = Field(..., description="Recommended protein (g)")
    carbs:    float = Field(..., description="Recommended carbohydrates (g)")
    fat:      float = Field(..., description="Recommended fat (g)")
