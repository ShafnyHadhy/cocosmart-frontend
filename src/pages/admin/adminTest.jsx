import React from "react";
import StatsGrid from "../../components/adminDashboard/statisGrid";
import ChartSection from "../../components/adminDashboard/chartSection";

export default function Dashboard(){
    return(
        <div className="space-y-6 p-2">
            <StatsGrid/>
            <ChartSection/>
        </div>
    )
}