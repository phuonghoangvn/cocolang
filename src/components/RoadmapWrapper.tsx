"use client";

import { useState } from "react";
import DuolingoRoadmap from "@/components/DuolingoRoadmap";

interface RoadmapWrapperProps {
  tasks: any[];
  completedIds: string[];
  initialTrack: string;
  userAvatar: string;
}

export default function RoadmapWrapper({ tasks, completedIds, initialTrack, userAvatar }: RoadmapWrapperProps) {
  const [activeTrack, setActiveTrack] = useState(initialTrack || "SWEDISH");

  return (
    <DuolingoRoadmap
      tasks={tasks}
      completedIds={completedIds}
      activeTrack={activeTrack}
      onSwitchTrack={setActiveTrack}
      userAvatar={userAvatar}
    />
  );
}
