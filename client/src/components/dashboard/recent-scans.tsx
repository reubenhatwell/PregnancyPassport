import { Scan } from "@/types";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Plus, ZoomIn } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

interface RecentScansProps {
  scans: Scan[];
}

export default function RecentScans({ scans }: RecentScansProps) {
  const [selectedScan, setSelectedScan] = useState<Scan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Sort by date (newest first) and get the most recent scans
  const recentScans = [...scans]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4); // Only show the 4 most recent scans on dashboard
  
  const openScanPreview = (scan: Scan) => {
    setSelectedScan(scan);
    setIsDialogOpen(true);
  };

  // Placeholder images if no real scan images are available
  const placeholderImages = [
    "https://pixabay.com/get/ga554aa6bba38e3cda3d75b2e66929f2c435fb23025e814c1bad032702853daf2c43fcdaff1d5324c7638ba76096f59a7ed70234004ab36f29b4bc66d09c9080d_1280.jpg",
    "https://pixabay.com/get/g0871e3519886cae30c66556289c6e2ad56dc333e07267004b126d209fb51ba6736f31deeefb2642b932d2f459d72f35bfd85b1bc78a7965cdb66696a10f68ac1_1280.jpg"
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-heading font-semibold text-gray-900">Recent Ultrasound Scans</h2>
        <Button variant="link" size="sm" asChild>
          <Link href="/scans-images">
            <Plus className="h-4 w-4 mr-1" />
            Upload
          </Link>
        </Button>
      </div>
      
      {recentScans.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500">No ultrasound scans uploaded yet.</p>
          <Button variant="outline" className="mt-2" asChild>
            <Link href="/scans-images">Upload scans</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            {recentScans.map((scan, index) => (
              <div key={scan.id} className="relative group">
                <img 
                  src={scan.imageUrl || placeholderImages[index % placeholderImages.length]} 
                  alt={scan.title} 
                  className="rounded-lg w-full h-32 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-xs rounded-b-lg">
                  {scan.title} ({formatDate(scan.date).split(' ')[1]} {formatDate(scan.date).split(' ')[0].slice(0, 3)})
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="bg-white rounded-full shadow-md h-8 w-8"
                    onClick={() => openScanPreview(scan)}
                  >
                    <ZoomIn className="h-4 w-4 text-gray-800" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <Link 
            href="/scans-images" 
            className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center justify-center mt-4"
          >
            View all scans
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"></path>
              <path d="M12 5l7 7-7 7"></path>
            </svg>
          </Link>
        </>
      )}
      
      {/* Scan Preview Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedScan?.title}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center">
            {selectedScan && (
              <>
                <img 
                  src={
                    selectedScan.imageUrl || 
                    placeholderImages[recentScans.indexOf(selectedScan) % placeholderImages.length]
                  } 
                  alt={selectedScan.title} 
                  className="rounded-lg w-full max-h-[70vh] object-contain"
                />
                <div className="w-full mt-4">
                  <p className="text-sm text-gray-500">
                    <strong>Date:</strong> {formatDate(selectedScan.date)}
                  </p>
                  {selectedScan.notes && (
                    <p className="text-sm text-gray-500 mt-2">
                      <strong>Notes:</strong> {selectedScan.notes}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
