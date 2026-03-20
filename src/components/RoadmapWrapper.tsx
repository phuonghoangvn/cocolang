"use client";

import { useState, useEffect } from "react";
import DuolingoRoadmap from "@/components/DuolingoRoadmap";

interface RoadmapWrapperProps {
  tasks: any[];
  completedIds: string[];
  initialTrack: string;
  userAvatar: string;
}

export default function RoadmapWrapper({ tasks, completedIds, initialTrack, userAvatar }: RoadmapWrapperProps) {
  const [activeTrack, setActiveTrack] = useState(initialTrack || "UX_ENGLISH");
  const [enrolledTracks, setEnrolledTracks] = useState<string[]>([initialTrack || "UX_ENGLISH"]);
  const [allTasks, setAllTasks] = useState(tasks);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch current enrollments on mount
  useEffect(() => {
    fetch("/api/enrollment")
      .then((r) => r.json())
      .then((data) => {
        if (data.enrollments?.length) {
          const tracks = data.enrollments.map((e: any) => e.category);
          // Always include English
          if (!tracks.includes("UX_ENGLISH")) tracks.push("UX_ENGLISH");
          setEnrolledTracks(tracks);
        }
      })
      .catch(() => {
        // Fallback: just include the active track
        setEnrolledTracks(["UX_ENGLISH"]);
      });
  }, []);

  const handleSwitchTrack = async (track: string) => {
    setActiveTrack(track);
    // Persist to DB so it survives page reloads/redirects
    try {
      await fetch("/api/profile", {
        method: "POST",
        body: JSON.stringify({ activeTrack: track }),
      });
    } catch (e) {
      console.error("Failed to persist active track", e);
    }
  };

  const handleEnrollSwedish = async () => {
    // Also switch active track to Swedish in DB
    handleSwitchTrack("SWEDISH");
    
    // Optimistically add Swedish to enrolled tracks
    setEnrolledTracks((prev) => (prev.includes("SWEDISH") ? prev : [...prev, "SWEDISH"]));
    setLoadingMore(true);

    // Poll for new tasks for a limited time
    let attempts = 0;
    const maxAttempts = 10;
    const pollInterval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch("/api/tasks?category=SWEDISH");
        const data = await res.json();
        if (data.tasks?.length > 0) {
          setAllTasks((prev) => {
            const existingIds = new Set(prev.map((t: any) => t.id));
            const newTasks = data.tasks.filter((t: any) => !existingIds.has(t.id));
            return [...prev, ...newTasks];
          });
          clearInterval(pollInterval);
          setLoadingMore(false);
        }
      } catch {
        // ignore
      }
      if (attempts >= maxAttempts) {
        clearInterval(pollInterval);
        setLoadingMore(false);
      }
    }, 3000);
  };

  return (
    <DuolingoRoadmap
      tasks={allTasks}
      completedIds={completedIds}
      activeTrack={activeTrack}
      enrolledTracks={enrolledTracks}
      onSwitchTrack={handleSwitchTrack}
      onEnrollSwedish={handleEnrollSwedish}
      userAvatar={userAvatar}
    />
  );
}
