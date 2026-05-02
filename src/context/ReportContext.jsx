import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const ReportContext = createContext();

export function useReports() {
  return useContext(ReportContext);
}

export function ReportProvider({ children }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Set up real-time listener to Firestore
  useEffect(() => {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReports = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReports(fetchedReports);
      setLoading(false);
      console.log("📊 Global Reports Synced:", fetchedReports.length);
    }, (error) => {
      console.error("❌ Error syncing reports:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addReport = async (newReport) => {
    try {
      console.log("🚀 Filing new global report to Firebase...");
      
      // Auto-escalation Logic (Replicating backend logic)
      const ONE_HOUR = 60 * 60 * 1000;
      const now = new Date();
      const similarReports = reports.filter(r => 
        r.location_label === newReport.location_label && 
        (now - new Date(r.createdAt)) < ONE_HOUR
      );

      let finalPriority = newReport.priority;
      if (similarReports.length >= 2) {
        console.log(`🔥 CLUSTER DETECTED at ${newReport.location_label}. Escalating to High.`);
        finalPriority = "High";
      }

      const reportToSave = {
        ...newReport,
        priority: finalPriority,
        displayId: `REP-${Math.floor(Math.random()*10000)}`,
        createdAt: now.toISOString(),
        status: "pending"
      };

      await addDoc(collection(db, 'reports'), reportToSave);
      console.log("✅ Report globally filed successfully");
    } catch (error) {
      console.error("❌ Error adding global report:", error);
    }
  };

  const updateReportStatus = async (id, updates) => {
    try {
      console.log(`📡 Sending global status update for ${id}...`, updates);
      const docRef = doc(db, 'reports', id);
      await updateDoc(docRef, { ...updates, updatedAt: new Date().toISOString() });
      console.log(`✅ Status update successful for ${id}`);
    } catch (error) {
      console.error(`❌ Network error updating report ${id}:`, error);
    }
  };

  const markInProgress = (id) => updateReportStatus(id, { status: 'in_progress' });

  const resolveReport = (id, responseText, proofUrl = null, locationVerified = null) => {
    updateReportStatus(id, {
      status: 'resolved_by_moderator',
      moderatorResponse: responseText,
      moderatorProofUrl: proofUrl,
      locationVerified: locationVerified
    });
  };

  const confirmResolution = (id) => updateReportStatus(id, { status: 'completed', userConfirmed: true });

  const reopenReport = (id) => updateReportStatus(id, { status: 'reopened', userConfirmed: false });

  return (
    <ReportContext.Provider value={{ reports, addReport, markInProgress, resolveReport, confirmResolution, reopenReport, loading }}>
      {children}
    </ReportContext.Provider>
  );
}
