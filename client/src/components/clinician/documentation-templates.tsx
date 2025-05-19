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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Download, Copy, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Template type definition
interface DocumentTemplate {
  id: string;
  title: string;
  description: string;
  category: "assessment" | "followup" | "referral" | "plan" | "summary";
  content: string;
}

// Demo templates for the different categories
const demoTemplates: DocumentTemplate[] = [
  {
    id: "initial-assessment",
    title: "Initial Antenatal Assessment",
    description: "Comprehensive first visit assessment template",
    category: "assessment",
    content: `INITIAL ANTENATAL ASSESSMENT

Patient Name: [PATIENT_NAME]
Date of Birth: [DOB]
Medical Record Number: [MRN]
Date of Assessment: [TODAY]

OBSTETRIC HISTORY:
Gravida: 
Para: 
Due Date (EDD): 
Last Menstrual Period: 
EDD Determined By: 

MEDICAL HISTORY:
Past Medical History:
Past Surgical History:
Allergies:
Current Medications:
Family History:

SOCIAL HISTORY:
Smoking Status:
Alcohol Use:
Substance Use:
Occupation:
Living Situation:

PHYSICAL EXAMINATION:
BP: 
Pulse: 
Weight: 
Height: 
BMI: 
Fundal Height: 
Fetal Heart Rate: 

ASSESSMENT:
[ASSESSMENT]

PLAN:
[PLAN]

Provider Signature: ____________________
Date: [TODAY]`
  },
  {
    id: "routine-followup",
    title: "Routine Follow-up Visit",
    description: "Template for standard follow-up visits",
    category: "followup",
    content: `ROUTINE ANTENATAL FOLLOW-UP VISIT

Patient Name: [PATIENT_NAME]
Date of Birth: [DOB]
Medical Record Number: [MRN]
Date of Visit: [TODAY]
Gestational Age: [WEEKS] weeks

SUBJECTIVE:
Chief Concerns:
Fetal Movement:
Contractions:
Vaginal Bleeding:
Other Symptoms:

OBJECTIVE:
BP: 
Pulse: 
Weight: 
Weight Change: 
Fundal Height: 
Fetal Heart Rate: 
Fetal Position:
Edema:
Urine Dipstick:

ASSESSMENT:
[ASSESSMENT]

PLAN:
1. Next appointment:
2. Tests ordered:
3. Recommendations:

Provider Signature: ____________________
Date: [TODAY]`
  },
  {
    id: "specialist-referral",
    title: "Specialist Referral Letter",
    description: "Template for referring to specialists",
    category: "referral",
    content: `ANTENATAL REFERRAL LETTER

[TODAY]

RE: [PATIENT_NAME], DOB: [DOB], MRN: [MRN]

Dear Dr. [SPECIALIST_NAME],

I am writing to refer Mrs./Ms. [PATIENT_NAME] who is currently [WEEKS] weeks pregnant with an EDD of [DUE_DATE].

REASON FOR REFERRAL:
[REASON]

RELEVANT HISTORY:
Obstetric:
Medical:
Surgical:
Current Medications:
Allergies:

RECENT INVESTIGATIONS:
[INVESTIGATIONS]

CURRENT STATUS:
[STATUS]

I would appreciate your assessment and recommendations.

Thank you for your assistance in the care of this patient.

Sincerely,

[PROVIDER_NAME]
Contact: [CONTACT_INFO]`
  },
  {
    id: "birth-plan",
    title: "Birth Plan Discussion",
    description: "Template for birth planning consultation",
    category: "plan",
    content: `BIRTH PLAN DISCUSSION RECORD

Patient Name: [PATIENT_NAME]
Date of Birth: [DOB]
Medical Record Number: [MRN]
Due Date: [DUE_DATE]
Date of Discussion: [TODAY]

LABOR PREFERENCES:
Environment:
Support People:
Pain Management:
Mobility During Labor:
Fetal Monitoring:
Labor Augmentation:

BIRTH PREFERENCES:
Delivery Position:
Pushing Techniques:
Episiotomy:
Assisted Delivery:
Cord Clamping:
Skin-to-Skin Contact:

NEWBORN CARE:
Feeding Plans:
Vitamin K Administration:
Eye Prophylaxis:
Circumcision (if applicable):
Rooming-In:

SPECIAL CONSIDERATIONS:
[SPECIAL_CONSIDERATIONS]

This birth plan has been discussed and agreed upon with the understanding that it may need to be modified in certain clinical situations. The primary goal is the health and safety of both mother and baby.

Patient Signature: ____________________ Date: [TODAY]
Provider Signature: ____________________ Date: [TODAY]`
  },
  {
    id: "discharge-summary",
    title: "Discharge Summary",
    description: "Template for hospital discharge summary",
    category: "summary",
    content: `OBSTETRIC DISCHARGE SUMMARY

Patient Name: [PATIENT_NAME]
Date of Birth: [DOB]
Medical Record Number: [MRN]
Admission Date: [ADMIT_DATE]
Discharge Date: [DISCHARGE_DATE]

DELIVERY INFORMATION:
Date of Delivery:
Time of Delivery:
Gestational Age:
Mode of Delivery:
Complications:
Anesthesia:

MATERNAL INFORMATION:
Pre-Delivery Diagnosis:
Post-Delivery Diagnosis:
Estimated Blood Loss:
Postpartum Course:
Medications at Discharge:

NEWBORN INFORMATION:
Sex:
Birth Weight:
Apgar Scores:
Complications:
Feeding Method:

DISCHARGE INSTRUCTIONS:
Activity Restrictions:
Medications:
Diet:
Wound Care:
Signs and Symptoms to Report:
Follow-Up Appointments:

Provider Signature: ____________________
Date: [TODAY]`
  }
];

interface DocumentationTemplatesProps {
  patientId?: number;
  patientName?: string;
}

export default function DocumentationTemplates({ patientId, patientName }: DocumentationTemplatesProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("assessment");
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [documentTitle, setDocumentTitle] = useState("");
  
  const handleSelectTemplate = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    
    // Replace placeholder content with patient info if available
    let content = template.content;
    if (patientName) {
      content = content.replace(/\[PATIENT_NAME\]/g, patientName);
    }
    
    // Replace other placeholders with current information
    const today = new Date().toLocaleDateString();
    content = content.replace(/\[TODAY\]/g, today);
    
    setEditedContent(content);
    setDocumentTitle(template.title);
  };
  
  const handleSaveDocument = () => {
    // In a real app, this would save the document to the database
    toast({
      title: "Document saved",
      description: "The document has been saved successfully",
    });
  };
  
  const handlePrintDocument = () => {
    // In a real app, this would trigger printing
    toast({
      title: "Printing document",
      description: "The document is being sent to the printer",
    });
  };
  
  const handleCopyDocument = () => {
    navigator.clipboard.writeText(editedContent)
      .then(() => {
        toast({
          title: "Copied to clipboard",
          description: "Document content copied to clipboard",
        });
      })
      .catch(() => {
        toast({
          title: "Copy failed",
          description: "Failed to copy document to clipboard",
          variant: "destructive",
        });
      });
  };
  
  const handleDownloadDocument = () => {
    // Create a blob and download it
    const blob = new Blob([editedContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${documentTitle.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    toast({
      title: "Document downloaded",
      description: "The document has been downloaded as a text file",
    });
  };
  
  const filterTemplatesByCategory = (category: string) => {
    return demoTemplates.filter(template => template.category === category);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Clinical Documentation Templates</CardTitle>
          <CardDescription>
            Standardized templates for clinical documentation
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs 
            defaultValue={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="mb-4 grid grid-cols-5">
              <TabsTrigger value="assessment">Assessments</TabsTrigger>
              <TabsTrigger value="followup">Follow-ups</TabsTrigger>
              <TabsTrigger value="referral">Referrals</TabsTrigger>
              <TabsTrigger value="plan">Care Plans</TabsTrigger>
              <TabsTrigger value="summary">Summaries</TabsTrigger>
            </TabsList>
            
            {["assessment", "followup", "referral", "plan", "summary"].map((category) => (
              <TabsContent key={category} value={category}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterTemplatesByCategory(category).map((template) => (
                    <div 
                      key={template.id}
                      className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleSelectTemplate(template)}
                    >
                      <div className="flex items-start gap-2">
                        <FileText className="h-5 w-5 text-primary-500 mt-0.5" />
                        <div>
                          <h3 className="font-medium">{template.title}</h3>
                          <p className="text-sm text-gray-500">{template.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
      
      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Document</CardTitle>
            <CardDescription>
              Customize the template for this patient
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="document-title">Document Title</Label>
              <Input 
                id="document-title"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="document-content">Content</Label>
              <Textarea 
                id="document-content"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCopyDocument}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline" onClick={handleDownloadDocument}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" onClick={handlePrintDocument}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
            <Button onClick={handleSaveDocument}>Save Document</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}