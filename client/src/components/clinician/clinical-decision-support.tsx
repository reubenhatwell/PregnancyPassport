import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { 
  AlertCircle, 
  BookOpen, 
  Calculator, 
  Check, 
  ClipboardList, 
  Info, 
  PieChart, 
  Shield 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Risk assessment calculators
interface RiskCalculator {
  id: string;
  title: string;
  description: string;
  factors: RiskFactor[];
  calculateRisk: (factors: Record<string, any>) => RiskResult;
}

interface RiskFactor {
  id: string;
  label: string;
  type: "select" | "number" | "boolean" | "slider";
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  defaultValue: any;
}

interface RiskResult {
  score: number;
  interpretation: string;
  recommendation: string;
  riskLevel: "low" | "moderate" | "high";
}

// Clinical guidelines
interface ClinicalGuideline {
  id: string;
  title: string;
  summary: string;
  sections: {
    title: string;
    content: string;
  }[];
}

// Sample risk calculators
const riskCalculators: RiskCalculator[] = [
  {
    id: "preeclampsia",
    title: "Pre-eclampsia Risk Assessment",
    description: "Calculate risk of pre-eclampsia based on maternal factors",
    factors: [
      {
        id: "age",
        label: "Maternal Age",
        type: "number",
        min: 15,
        max: 60,
        defaultValue: 30
      },
      {
        id: "bmi",
        label: "Body Mass Index (kg/m²)",
        type: "number",
        min: 15,
        max: 60,
        defaultValue: 25
      },
      {
        id: "history",
        label: "Previous Pre-eclampsia",
        type: "boolean",
        defaultValue: false
      },
      {
        id: "chronic_hypertension",
        label: "Chronic Hypertension",
        type: "boolean",
        defaultValue: false
      },
      {
        id: "diabetes",
        label: "Pre-existing Diabetes",
        type: "select",
        options: [
          { value: "none", label: "None" },
          { value: "type1", label: "Type 1" },
          { value: "type2", label: "Type 2" },
          { value: "gestational", label: "Gestational" }
        ],
        defaultValue: "none"
      },
      {
        id: "ethnicity",
        label: "Ethnicity",
        type: "select",
        options: [
          { value: "white", label: "White" },
          { value: "black", label: "Black" },
          { value: "asian", label: "South Asian" },
          { value: "east_asian", label: "East Asian" },
          { value: "hispanic", label: "Hispanic" },
          { value: "other", label: "Other" }
        ],
        defaultValue: "white"
      }
    ],
    calculateRisk: (factors) => {
      // This is a simplified risk calculation for demo purposes
      // Real clinical calculators would use validated algorithms
      let score = 0;
      
      // Age risk factor
      if (factors.age > 40) score += 3;
      else if (factors.age > 35) score += 2;
      
      // BMI risk factor
      if (factors.bmi > 35) score += 3;
      else if (factors.bmi > 30) score += 2;
      else if (factors.bmi > 25) score += 1;
      
      // History of pre-eclampsia
      if (factors.history) score += 4;
      
      // Chronic hypertension
      if (factors.chronic_hypertension) score += 3;
      
      // Diabetes
      if (factors.diabetes === "type1") score += 3;
      else if (factors.diabetes === "type2") score += 2;
      else if (factors.diabetes === "gestational") score += 1;
      
      // Ethnicity risk factors
      if (factors.ethnicity === "black") score += 2;
      
      let riskLevel: "low" | "moderate" | "high" = "low";
      let interpretation = "";
      let recommendation = "";
      
      if (score <= 2) {
        riskLevel = "low";
        interpretation = "Low risk of developing pre-eclampsia";
        recommendation = "Routine antenatal care";
      } else if (score <= 5) {
        riskLevel = "moderate";
        interpretation = "Moderate risk of developing pre-eclampsia";
        recommendation = "Consider low-dose aspirin prophylaxis and increased monitoring";
      } else {
        riskLevel = "high";
        interpretation = "High risk of developing pre-eclampsia";
        recommendation = "Initiate low-dose aspirin prophylaxis. Increased antenatal monitoring recommended.";
      }
      
      return {
        score,
        interpretation,
        recommendation,
        riskLevel
      };
    }
  },
  {
    id: "gdm",
    title: "Gestational Diabetes Risk Assessment",
    description: "Evaluate risk factors for gestational diabetes",
    factors: [
      {
        id: "age",
        label: "Maternal Age",
        type: "number",
        min: 15,
        max: 60,
        defaultValue: 30
      },
      {
        id: "bmi",
        label: "Body Mass Index (kg/m²)",
        type: "number",
        min: 15,
        max: 60,
        defaultValue: 25
      },
      {
        id: "previous_gdm",
        label: "Previous Gestational Diabetes",
        type: "boolean",
        defaultValue: false
      },
      {
        id: "family_diabetes",
        label: "Family History of Diabetes",
        type: "boolean",
        defaultValue: false
      },
      {
        id: "pcos",
        label: "PCOS",
        type: "boolean",
        defaultValue: false
      },
      {
        id: "ethnicity",
        label: "High-Risk Ethnic Group",
        type: "boolean",
        defaultValue: false
      },
      {
        id: "previous_macrosomia",
        label: "Previous Macrosomic Baby (>4.5kg)",
        type: "boolean",
        defaultValue: false
      }
    ],
    calculateRisk: (factors) => {
      // Simplified risk calculation
      let score = 0;
      
      // Age risk factor
      if (factors.age >= 40) score += 3;
      else if (factors.age >= 35) score += 2;
      else if (factors.age >= 30) score += 1;
      
      // BMI risk factor
      if (factors.bmi >= 35) score += 4;
      else if (factors.bmi >= 30) score += 3;
      else if (factors.bmi >= 25) score += 2;
      
      // Previous GDM
      if (factors.previous_gdm) score += 6;
      
      // Family history
      if (factors.family_diabetes) score += 2;
      
      // PCOS
      if (factors.pcos) score += 2;
      
      // Ethnicity
      if (factors.ethnicity) score += 3;
      
      // Previous macrosomia
      if (factors.previous_macrosomia) score += 2;
      
      let riskLevel: "low" | "moderate" | "high" = "low";
      let interpretation = "";
      let recommendation = "";
      
      if (score <= 3) {
        riskLevel = "low";
        interpretation = "Low risk of gestational diabetes";
        recommendation = "Consider routine screening at 24-28 weeks";
      } else if (score <= 7) {
        riskLevel = "moderate";
        interpretation = "Moderate risk of gestational diabetes";
        recommendation = "Consider early screening at 16-18 weeks and repeat at 24-28 weeks if negative";
      } else {
        riskLevel = "high";
        interpretation = "High risk of gestational diabetes";
        recommendation = "Early screening at first antenatal visit and again at 24-28 weeks if negative";
      }
      
      return {
        score,
        interpretation,
        recommendation,
        riskLevel
      };
    }
  },
  {
    id: "preterm",
    title: "Preterm Labor Risk Evaluation",
    description: "Calculate risk of preterm labor",
    factors: [
      {
        id: "previous_preterm",
        label: "Previous Preterm Birth",
        type: "boolean",
        defaultValue: false
      },
      {
        id: "cervical_length",
        label: "Cervical Length (mm)",
        type: "number",
        min: 0,
        max: 50,
        defaultValue: 35
      },
      {
        id: "multiple_pregnancy",
        label: "Multiple Pregnancy",
        type: "boolean",
        defaultValue: false
      },
      {
        id: "uterine_anomalies",
        label: "Uterine Anomalies",
        type: "boolean",
        defaultValue: false
      },
      {
        id: "previous_cervical_procedures",
        label: "Previous Cervical Procedures",
        type: "boolean",
        defaultValue: false
      },
      {
        id: "bleeding",
        label: "Second-Trimester Bleeding",
        type: "boolean",
        defaultValue: false
      }
    ],
    calculateRisk: (factors) => {
      // Simplified risk calculation 
      let score = 0;
      
      // Previous preterm birth
      if (factors.previous_preterm) score += 5;
      
      // Cervical length
      if (factors.cervical_length < 15) score += 5;
      else if (factors.cervical_length < 25) score += 3;
      
      // Multiple pregnancy
      if (factors.multiple_pregnancy) score += 4;
      
      // Uterine anomalies
      if (factors.uterine_anomalies) score += 2;
      
      // Previous cervical procedures
      if (factors.previous_cervical_procedures) score += 2;
      
      // Second-trimester bleeding
      if (factors.bleeding) score += 2;
      
      let riskLevel: "low" | "moderate" | "high" = "low";
      let interpretation = "";
      let recommendation = "";
      
      if (score <= 2) {
        riskLevel = "low";
        interpretation = "Low risk of preterm labor";
        recommendation = "Routine antenatal care";
      } else if (score <= 6) {
        riskLevel = "moderate";
        interpretation = "Moderate risk of preterm labor";
        recommendation = "Consider increased surveillance with regular cervical length measurements";
      } else {
        riskLevel = "high";
        interpretation = "High risk of preterm labor";
        recommendation = "Consider progesterone supplementation and/or cervical cerclage. Increased monitoring recommended.";
      }
      
      return {
        score,
        interpretation,
        recommendation,
        riskLevel
      };
    }
  }
];

// Sample clinical guidelines
const clinicalGuidelines: ClinicalGuideline[] = [
  {
    id: "antenatal-care",
    title: "Antenatal Care Protocol",
    summary: "Standard guidelines for routine antenatal care",
    sections: [
      {
        title: "First Trimester (0-13 weeks)",
        content: `
First Visit (6-8 weeks):
- Confirm pregnancy
- Complete medical and obstetric history
- Calculate EDD based on LMP or early ultrasound
- Blood pressure, weight, height, BMI
- Blood tests: CBC, blood group, Rh status, antibody screen, rubella immunity, hepatitis B, HIV, syphilis
- Urine test for protein, glucose
- Discuss screening options
- Prescribe prenatal vitamins with folic acid

Dating Scan (8-12 weeks):
- Confirm viability and number of fetuses
- Determine gestational age
- Measure nuchal translucency if screening accepted

11-13 weeks:
- Review test results
- Blood pressure, weight
- First trimester combined screening if desired
- Assess risk factors for pregnancy complications
`
      },
      {
        title: "Second Trimester (14-26 weeks)",
        content: `
16 weeks:
- Blood pressure, weight
- Urine test
- Listen to fetal heart
- Discuss results of screening tests

20-22 weeks:
- Anatomy/morphology ultrasound scan
- Blood pressure, weight
- Fetal movement assessment
- Fundal height measurement
- Review ultrasound results

24-26 weeks:
- Blood pressure, weight
- Fundal height measurement
- Glucose challenge test for gestational diabetes screening
- Anti-D for Rh-negative women
`
      },
      {
        title: "Third Trimester (27-40+ weeks)",
        content: `
28 weeks:
- Blood pressure, weight
- Fundal height measurement
- Fetal position assessment
- Blood tests: CBC to check for anemia
- Anti-D for Rh-negative women

32 weeks:
- Blood pressure, weight
- Fundal height measurement
- Fetal position assessment
- Review test results

36 weeks:
- Blood pressure, weight
- Fundal height measurement
- Check fetal position
- Group B Streptococcus screening
- Discuss birth plan and options

38-41 weeks (weekly):
- Blood pressure, weight
- Fundal height measurement
- Fetal position assessment
- Discuss induction options if approaching 41 weeks
`
      }
    ]
  },
  {
    id: "hypertension",
    title: "Hypertension in Pregnancy",
    summary: "Guidelines for managing hypertensive disorders",
    sections: [
      {
        title: "Definitions",
        content: `
Chronic Hypertension:
- Hypertension that predates the pregnancy or is diagnosed before 20 weeks gestation
- BP ≥ 140/90 mmHg on two separate occasions at least 4 hours apart

Gestational Hypertension:
- New onset hypertension after 20 weeks gestation without proteinuria
- BP ≥ 140/90 mmHg on two separate occasions at least 4 hours apart

Pre-eclampsia:
- Hypertension after 20 weeks gestation with one or more of the following:
  - Proteinuria (≥ 300mg/24h or protein/creatinine ratio ≥ 0.3)
  - Maternal organ dysfunction:
    - Renal insufficiency
    - Liver involvement
    - Neurological complications
    - Hematological complications
    - Uteroplacental dysfunction
  - Fetal growth restriction

Severe Features of Pre-eclampsia:
- Systolic BP ≥ 160 mmHg or diastolic BP ≥ 110 mmHg
- Thrombocytopenia (platelet count < 100,000/microliter)
- Impaired liver function (elevated transaminases to twice normal concentration)
- Progressive renal insufficiency (serum creatinine > 1.1 mg/dL)
- Pulmonary edema
- New-onset cerebral or visual disturbances
`
      },
      {
        title: "Management",
        content: `
Chronic Hypertension:
- Continue antihypertensive medication except ACE inhibitors and ARBs
- Target BP: 120-160/80-105 mmHg
- Monitor for development of pre-eclampsia
- Serial growth scans every 4 weeks from 28 weeks
- Consider low-dose aspirin (81-150 mg/day) started before 16 weeks gestation

Gestational Hypertension:
- If BP < 160/110 mmHg: weekly antenatal visits, home BP monitoring
- If BP ≥ 160/110 mmHg: treat with antihypertensive medication
- Serial growth scans every 4 weeks
- Weekly assessment of symptoms
- Blood tests for pre-eclampsia as indicated
- Consider delivery at 37-39 weeks depending on severity

Pre-eclampsia:
Without severe features:
- Hospitalize initially for assessment
- If stable, may consider outpatient management with:
  - Twice weekly BP and symptom monitoring
  - Weekly blood tests
  - Twice weekly fetal testing
  - Delivery at 37 weeks

With severe features:
- Inpatient management
- Magnesium sulfate for seizure prophylaxis
- BP control with IV labetalol, hydralazine, or oral nifedipine
- Delivery indicated regardless of gestational age if:
  - Uncontrollable severe hypertension
  - Eclampsia
  - Pulmonary edema
  - DIC
  - Placental abruption
  - Abnormal fetal testing
- Otherwise, consider delivery at 34 weeks after corticosteroids
`
      },
      {
        title: "Prevention",
        content: `
Low-dose aspirin:
- 81-150 mg/day started at 12-16 weeks and continued until delivery
- Recommended for women with:
  - Previous pre-eclampsia
  - Multifetal gestation
  - Chronic hypertension
  - Pre-gestational diabetes
  - Renal disease
  - Autoimmune disease (SLE, antiphospholipid syndrome)
  - Combination of moderate risk factors

Calcium supplementation:
- 1.5-2 g of elemental calcium daily
- Consider in women with low dietary calcium intake

Lifestyle modifications:
- Regular exercise
- Balanced diet
- Optimal weight management before pregnancy
- Salt intake not restricted
- Vitamin C and E supplementation not recommended
`
      }
    ]
  },
  {
    id: "gd-management",
    title: "Gestational Diabetes Management",
    summary: "Treatment protocols for gestational diabetes",
    sections: [
      {
        title: "Screening and Diagnosis",
        content: `
Screening Approaches:
- One-step approach: 75g OGTT at 24-28 weeks
- Two-step approach: 50g glucose challenge test, followed by 100g OGTT if positive

Diagnostic Criteria (75g OGTT):
- Fasting: ≥ 92 mg/dL (5.1 mmol/L)
- 1 hour: ≥ 180 mg/dL (10.0 mmol/L)
- 2 hour: ≥ 153 mg/dL (8.5 mmol/L)
- One or more abnormal values confirms GDM

High-Risk Women (early screening recommended):
- Previous GDM
- Known impaired glucose metabolism
- BMI ≥ 30 kg/m²
- Previous macrosomic baby (>4.5kg)
- First-degree relative with diabetes
- High-risk ethnicity (South Asian, Middle Eastern, African, Indigenous)
`
      },
      {
        title: "Management",
        content: `
Initial Management:
- Referral to diabetic specialist service
- Nutritional counseling
- Physical activity guidance
- Blood glucose monitoring
- Education on GDM and its implications

Target Blood Glucose Levels:
- Fasting: < 95 mg/dL (5.3 mmol/L)
- 1 hour post-meal: < 140 mg/dL (7.8 mmol/L)
- 2 hours post-meal: < 120 mg/dL (6.7 mmol/L)

Dietary Recommendations:
- Individualized meal plan
- 30-45% carbohydrates, focusing on low glycemic index foods
- 20-25% protein
- 30-40% fat, primarily unsaturated
- Regular meals and snacks
- Carbohydrate distribution throughout the day

Physical Activity:
- 30 minutes of moderate activity on most days
- Safe activities include walking, swimming, stationary cycling
- Avoid activities with risk of falling or abdominal trauma

Medication:
- Indicated when dietary and lifestyle changes fail to achieve target glucose levels
- First-line: Insulin (various regimens based on glucose pattern)
- Metformin may be considered if insulin declined or unavailable
- Sulfonylureas not generally recommended as first-line
`
      },
      {
        title: "Monitoring and Delivery",
        content: `
Maternal Monitoring:
- Self-monitoring of blood glucose 4-7 times daily
- Regular review of glucose logs
- HbA1c every 4-6 weeks
- Weight gain monitoring
- Blood pressure monitoring
- Urine testing for proteinuria

Fetal Monitoring:
- Growth scans every 4 weeks from 28 weeks
- Increased surveillance if evidence of macrosomia or growth restriction
- Amniotic fluid volume assessment
- Fetal well-being assessment if indicated

Timing of Delivery:
- Well-controlled GDM on diet only: consider up to 40-41 weeks
- GDM requiring medication:
  - Consider induction at 39 weeks
  - Earlier delivery may be indicated with complications
- If estimated fetal weight > 4500g, consider cesarean delivery

Postpartum:
- Discontinue glucose-lowering medications immediately after delivery
- 75g OGTT at 6-12 weeks postpartum to identify persistent diabetes
- Annual screening for diabetes
- Counseling on risk reduction for type 2 diabetes
`
      }
    ]
  }
];

interface ClinicalDecisionSupportProps {
  patientId?: number;
}

export default function ClinicalDecisionSupport({ patientId }: ClinicalDecisionSupportProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("calculators");
  const [selectedCalculator, setSelectedCalculator] = useState<RiskCalculator | null>(null);
  const [calculatorValues, setCalculatorValues] = useState<Record<string, any>>({});
  const [calculationResult, setCalculationResult] = useState<RiskResult | null>(null);
  
  const handleSelectCalculator = (calculator: RiskCalculator) => {
    setSelectedCalculator(calculator);
    
    // Initialize default values
    const initialValues: Record<string, any> = {};
    calculator.factors.forEach(factor => {
      initialValues[factor.id] = factor.defaultValue;
    });
    
    setCalculatorValues(initialValues);
    setCalculationResult(null);
  };
  
  const handleInputChange = (factorId: string, value: any) => {
    setCalculatorValues(prev => ({
      ...prev,
      [factorId]: value
    }));
  };
  
  const handleCalculate = () => {
    if (!selectedCalculator) return;
    
    const result = selectedCalculator.calculateRisk(calculatorValues);
    setCalculationResult(result);
    
    toast({
      title: "Risk calculated",
      description: `${selectedCalculator.title} calculation completed`,
    });
  };
  
  const getRiskLevelColor = (level: "low" | "moderate" | "high") => {
    switch(level) {
      case "low": return "text-green-600 bg-green-50 border-green-200";
      case "moderate": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "high": return "text-red-600 bg-red-50 border-red-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div>
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="calculators">Risk Calculators</TabsTrigger>
          <TabsTrigger value="guidelines">Clinical Guidelines</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calculators">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Risk Assessment Tools</CardTitle>
                <CardDescription>
                  Calculate clinical risks based on patient factors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {riskCalculators.map((calculator) => (
                    <div 
                      key={calculator.id}
                      className={`border rounded-md p-4 hover:bg-gray-50 cursor-pointer ${selectedCalculator?.id === calculator.id ? "border-primary-500 bg-primary-50" : ""}`}
                      onClick={() => handleSelectCalculator(calculator)}
                    >
                      <div className="flex items-start gap-2">
                        <Calculator className="h-5 w-5 text-primary-500 mt-0.5" />
                        <div>
                          <h3 className="font-medium">{calculator.title}</h3>
                          <p className="text-sm text-gray-500">{calculator.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {selectedCalculator ? (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>{selectedCalculator.title}</CardTitle>
                  <CardDescription>{selectedCalculator.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {selectedCalculator.factors.map((factor) => (
                      <div key={factor.id} className="space-y-2">
                        <Label htmlFor={factor.id}>{factor.label}</Label>
                        
                        {factor.type === "number" && (
                          <Input
                            id={factor.id}
                            type="number"
                            min={factor.min}
                            max={factor.max}
                            value={calculatorValues[factor.id]}
                            onChange={(e) => handleInputChange(factor.id, Number(e.target.value))}
                          />
                        )}
                        
                        {factor.type === "boolean" && (
                          <Select
                            value={calculatorValues[factor.id] ? "yes" : "no"}
                            onValueChange={(value) => handleInputChange(factor.id, value === "yes")}
                          >
                            <SelectTrigger id={factor.id}>
                              <SelectValue placeholder="Select option" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="yes">Yes</SelectItem>
                              <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                        
                        {factor.type === "select" && factor.options && (
                          <Select
                            value={calculatorValues[factor.id]}
                            onValueChange={(value) => handleInputChange(factor.id, value)}
                          >
                            <SelectTrigger id={factor.id}>
                              <SelectValue placeholder="Select option" />
                            </SelectTrigger>
                            <SelectContent>
                              {factor.options.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        
                        {factor.type === "slider" && (
                          <div className="space-y-2">
                            <Slider
                              id={factor.id}
                              min={factor.min || 0}
                              max={factor.max || 100}
                              step={factor.step || 1}
                              value={[calculatorValues[factor.id]]}
                              onValueChange={(value) => handleInputChange(factor.id, value[0])}
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>{factor.min || 0}</span>
                              <span>{calculatorValues[factor.id]}</span>
                              <span>{factor.max || 100}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    <Button onClick={handleCalculate} className="w-full">
                      Calculate Risk
                    </Button>
                    
                    {calculationResult && (
                      <div className={`border rounded-md p-6 mt-6 ${getRiskLevelColor(calculationResult.riskLevel)}`}>
                        <div className="flex items-start gap-2 mb-4">
                          <AlertCircle className="h-6 w-6 flex-shrink-0 mt-1" />
                          <div>
                            <h3 className="text-lg font-semibold capitalize">
                              {calculationResult.riskLevel} Risk
                            </h3>
                            <p className="text-sm">{calculationResult.interpretation}</p>
                          </div>
                        </div>
                        
                        <div className="border-t border-b py-4 my-4">
                          <h4 className="text-sm font-medium mb-2 flex items-center">
                            <ClipboardList className="h-4 w-4 mr-2" />
                            Recommendation
                          </h4>
                          <p>{calculationResult.recommendation}</p>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <PieChart className="h-5 w-5 mr-2" />
                            <span className="text-sm font-medium">Risk Score: {calculationResult.score}</span>
                          </div>
                          
                          <Button variant="secondary" size="sm">
                            Save to Patient Record
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="md:col-span-2">
                <CardContent className="p-8 text-center text-gray-500">
                  <Calculator className="h-10 w-10 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">Select a Risk Calculator</h3>
                  <p>Choose a calculator from the left to begin a risk assessment</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="guidelines">
          <Card>
            <CardHeader>
              <CardTitle>Clinical Practice Guidelines</CardTitle>
              <CardDescription>
                Evidence-based guidelines for clinical practice
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {clinicalGuidelines.map((guideline) => (
                  <AccordionItem key={guideline.id} value={guideline.id}>
                    <AccordionTrigger className="hover:bg-gray-50 p-4 hover:no-underline text-left">
                      <div className="flex items-start gap-3 pr-4">
                        <BookOpen className="h-5 w-5 text-primary-500 mt-0.5" />
                        <div>
                          <h3 className="font-medium">{guideline.title}</h3>
                          <p className="text-sm text-gray-500">{guideline.summary}</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 pt-0 border-t">
                      <div className="space-y-6">
                        {guideline.sections.map((section, index) => (
                          <div key={index} className="space-y-2">
                            <h4 className="font-medium flex items-center">
                              <Info className="h-4 w-4 mr-2 text-primary-500" />
                              {section.title}
                            </h4>
                            <div className="pl-6">
                              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">
                                {section.content}
                              </pre>
                            </div>
                          </div>
                        ))}
                        
                        <div className="flex justify-between pt-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <Shield className="h-4 w-4 mr-1" />
                            <span>Based on NHS guidelines</span>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Check className="h-4 w-4 mr-2" />
                              Apply to Treatment Plan
                            </Button>
                            <Button size="sm" variant="outline">
                              Download PDF
                            </Button>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}