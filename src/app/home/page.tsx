'use client'
import * as React from "react";
import { useEffect, useState } from "react"
import ReactMde from "react-mde";
import * as Showdown from "showdown";
import "react-mde/lib/styles/css/react-mde-all.css";
import MarkdownTree from "@/components/MarkdownTree";

const converter = new Showdown.Converter({
    tables: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    tasklists: true
  });
  
export default function Home() {
    const [value, setValue] = React.useState(`
# Document Title

Welcome to this example document. This document serves as a comprehensive example for testing Markdown-to-tree conversion.

## Section 1: Introduction

This section provides an overview of the topic and sets the stage for more detailed discussions later on.

### Subsection 1.1: Background

Here we discuss the background information in detail. It includes historical context and relevant background data.

#### Subsubsection 1.1.1: Historical Context

This part dives into the historical aspects, explaining how the topic evolved over time.

### Subsection 1.2: Current Status

In this subsection, we outline the current status, including recent developments and ongoing projects.

## Section 2: Detailed Analysis

The analysis section covers in-depth information and data.

- **Key Points:**
  - First important point.
  - Second important point.
    - Nested detail A.
    - Nested detail B.
- **Additional Observations:**
  - Observation one.
  - Observation two.

### Subsection 2.1: Data and Metrics

This subsection provides quantitative data and metrics used to analyze the subject.

## Section 3: Conclusion

This final section summarizes the insights and provides final thoughts.

Thank you for reading this detailed Markdown example.

`);
    const [selectedTab, setSelectedTab] = React.useState<"write" | "preview">("write");


    return (
        <div className="flex h-screen">
            <div className="w-1/2 p-2 flex flex-col"> 
                <div className="rounded-[2px] bg-[#FFFFFF] text-blue-500 h-full">
                    <ReactMde
                        value={value}
                        onChange={setValue}
                        selectedTab={selectedTab}
                        onTabChange={setSelectedTab}
                        generateMarkdownPreview={markdown =>
                            Promise.resolve(converter.makeHtml(markdown))
                        }
                        childProps={{
                            writeButton: {
                                tabIndex: -1
                            },
                            
                        }}
                    />
                    
                </div>
                
                {/* <div className="flex">
                    <button className="ml-auto mr-4 min-h-[20px] text-lg font-bold text-indigo-500
                     border-4 border-purple-200 rounded-md border-b-indigo-500"
                     onClick={() => { parseMarkdownToTree(value)}}
                    >
                        Convert to Tree
                    </button>
                </div> */}
                
            </div>

            <div className="w-1/2 p-2 flex h-screen"> 
                <MarkdownTree markdown={value}/>
            </div>
        </div>
    )
}