import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Pregnancy, VitalStat, TestResult, Scan } from "@/types";
import { Download, Printer, Share2 } from "lucide-react";
import { calculatePregnancyStats, formatDate } from "@/lib/utils";

interface ClinicalSummaryProps {
  patientId: number;
  pregnancyId: number;
}

export default function ClinicalSummary({ patientId, pregnancyId }: ClinicalSummaryProps) {
  const { data: pregnancy, isLoading: pregnancyLoading } = useQuery<Pregnancy>({
    queryKey: ["/api/pregnancy", pregnancyId],
    enabled: !!pregnancyId,
  });
  
  const { data: vitalStats, isLoading: vitalsLoading } = useQuery<VitalStat[]>({
    queryKey: ["/api/vital-stats", pregnancyId],
    enabled: !!pregnancyId,
  });
  
  const { data: testResults, isLoading: testsLoading } = useQuery<TestResult[]>({
    queryKey: ["/api/test-results", pregnancyId],
    enabled: !!pregnancyId,
  });
  
  const { data: scans, isLoading: scansLoading } = useQuery<Scan[]>({
    queryKey: ["/api/scans", pregnancyId],
    enabled: !!pregnancyId,
  });
  
  const isLoading = pregnancyLoading || vitalsLoading || testsLoading || scansLoading;

  const getPregnancyProgress = (): string => {
    if (!pregnancy) return "N/A";
    
    try {
      const stats = calculatePregnancyStats(pregnancy.dueDate, pregnancy.startDate);
      return `${stats.currentWeek} weeks (${Math.round(stats.progress)}%)`;
    } catch (error) {
      return "N/A";
    }
  };
  
  const getLatestVitalStat = (): VitalStat | undefined => {
    if (!vitalStats || vitalStats.length === 0) return undefined;
    
    return vitalStats.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
  };
  
  const getRecentTestResults = (limit: number = 3): TestResult[] => {
    if (!testResults || testResults.length === 0) return [];
    
    return testResults
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  };
  
  const getRecentScans = (limit: number = 2): Scan[] => {
    if (!scans || scans.length === 0) return [];
    
    return scans
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  };
  
  const latestVital = getLatestVitalStat();
  const recentTests = getRecentTestResults();
  const recentScans = getRecentScans();

  const generatePrintableSummary = () => {
    alert("Generating printable summary...");
    // In a real app, this would generate a printable version
  };
  
  const downloadSummary = () => {
    alert("Downloading summary...");
    // In a real app, this would download the summary as PDF
  };
  
  const shareSummary = () => {
    alert("Share dialog would open here...");
    // In a real app, this would open a sharing dialog
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p>Loading clinical summary...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Clinical Summary</CardTitle>
            <CardDescription>
              Comprehensive overview of the patient's pregnancy
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={generatePrintableSummary}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={downloadSummary}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={shareSummary}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
            <TabsTrigger value="tests">Test Results</TabsTrigger>
            <TabsTrigger value="scans">Scans & Images</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-md p-4">
                  <h3 className="text-sm font-medium text-gray-500">Pregnancy Progress</h3>
                  <p className="text-2xl font-bold mt-1">{getPregnancyProgress()}</p>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="text-sm font-medium text-gray-500">Due Date</h3>
                  <p className="text-2xl font-bold mt-1">
                    {pregnancy ? formatDate(pregnancy.dueDate) : "N/A"}
                  </p>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="text-sm font-medium text-gray-500">Pregnancy Type</h3>
                  <p className="text-2xl font-bold mt-1 capitalize">
                    {pregnancy?.pregnancyType || "Singleton"}
                  </p>
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="text-base font-medium mb-2">Recent Vital Signs</h3>
                {latestVital ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Blood Pressure</p>
                      <p className="font-medium">
                        {latestVital.bloodPressureSystolic}/{latestVital.bloodPressureDiastolic} mmHg
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Weight</p>
                      <p className="font-medium">
                        {latestVital.weight ? `${(latestVital.weight / 1000).toFixed(1)} kg` : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Fundal Height</p>
                      <p className="font-medium">
                        {latestVital.fundalHeight ? `${latestVital.fundalHeight} cm` : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date Recorded</p>
                      <p className="font-medium">{formatDate(latestVital.date)}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No vital signs recorded</p>
                )}
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="text-base font-medium mb-2">Recent Test Results</h3>
                {recentTests.length > 0 ? (
                  <div className="space-y-3">
                    {recentTests.map((test, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                        <div>
                          <p className="font-medium">{test.title}</p>
                          <p className="text-sm text-gray-500">{formatDate(test.date)}</p>
                        </div>
                        <Badge className={
                          test.status === "normal" ? "bg-green-50 text-green-700 border-green-200" :
                          test.status === "abnormal" ? "bg-red-50 text-red-700 border-red-200" :
                          "bg-yellow-50 text-yellow-700 border-yellow-200"
                        }>
                          {test.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No test results recorded</p>
                )}
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="text-base font-medium mb-2">Notes</h3>
                <p className="text-gray-700">{pregnancy?.notes || "No notes available"}</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="vitals">
            <div className="border rounded-md p-4">
              <h3 className="text-lg font-medium mb-4">Vital Signs History</h3>
              {vitalStats && vitalStats.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Pressure</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fundal Height</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {vitalStats.map((vital, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="px-4 py-2 whitespace-nowrap">{formatDate(vital.date)}</td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            {vital.bloodPressureSystolic}/{vital.bloodPressureDiastolic} mmHg
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            {vital.weight ? `${(vital.weight / 1000).toFixed(1)} kg` : "N/A"}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            {vital.fundalHeight ? `${vital.fundalHeight} cm` : "N/A"}
                          </td>
                          <td className="px-4 py-2">{vital.notes || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No vital signs records available</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="tests">
            <div className="border rounded-md p-4">
              <h3 className="text-lg font-medium mb-4">Test Results History</h3>
              {testResults && testResults.length > 0 ? (
                <div className="space-y-4">
                  {testResults.map((test, index) => (
                    <div key={index} className="border rounded-md p-4">
                      <div className="flex justify-between">
                        <h4 className="font-medium">{test.title}</h4>
                        <Badge className={
                          test.status === "normal" ? "bg-green-50 text-green-700 border-green-200" :
                          test.status === "abnormal" ? "bg-red-50 text-red-700 border-red-200" :
                          "bg-yellow-50 text-yellow-700 border-yellow-200"
                        }>
                          {test.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 mt-2">
                        <p className="text-sm text-gray-500">Date: {formatDate(test.date)}</p>
                        <p className="text-sm text-gray-500">Category: {test.category}</p>
                      </div>
                      {test.results && (
                        <div className="mt-3 text-sm">
                          <h5 className="font-medium">Results:</h5>
                          <pre className="mt-1 p-2 bg-gray-50 rounded overflow-x-auto whitespace-pre-wrap">
                            {JSON.stringify(test.results, null, 2)}
                          </pre>
                        </div>
                      )}
                      {test.notes && (
                        <div className="mt-3">
                          <h5 className="text-sm font-medium">Notes:</h5>
                          <p className="text-sm text-gray-700 mt-1">{test.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No test results available</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="scans">
            <div className="border rounded-md p-4">
              <h3 className="text-lg font-medium mb-4">Scans & Images</h3>
              {scans && scans.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scans.map((scan, index) => (
                    <div key={index} className="border rounded-md overflow-hidden">
                      {scan.imageUrl ? (
                        <div className="aspect-video bg-gray-100 flex items-center justify-center">
                          <img
                            src={scan.imageUrl}
                            alt={scan.title}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video bg-gray-100 flex items-center justify-center text-gray-400">
                          No image available
                        </div>
                      )}
                      <div className="p-3">
                        <h4 className="font-medium">{scan.title}</h4>
                        <p className="text-sm text-gray-500 mt-1">Date: {formatDate(scan.date)}</p>
                        {scan.notes && (
                          <p className="text-sm mt-2">{scan.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No scans or images available</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}