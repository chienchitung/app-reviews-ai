'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import cloud from 'd3-cloud';
import type { Keyword } from '@/types/feedback';

interface WordCloudProps {
  keywords: Keyword[];
}

interface CloudWord {
  text: string;
  size: number;
  value: number;
  x?: number;
  y?: number;
  rotate?: number;
}

export const WordCloud = ({ keywords }: WordCloudProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!keywords.length || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svg.node()?.parentElement?.clientWidth || 600;
    const height = svg.node()?.parentElement?.clientHeight || 400;

    svg.selectAll("*").remove();

    const layout = cloud<CloudWord>()
      .size([width, height])
      .words(keywords.map(d => ({
        text: d.word,
        size: 10 + Math.sqrt(d.count) * 10,
        value: d.count
      })))
      .padding(5)
      .rotate(() => 0)
      .fontSize((d: CloudWord) => d.size || 0)
      .on("end", draw);

    layout.start();

    function draw(words: CloudWord[]) {
      const g = svg.append("g")
        .attr("transform", `translate(${width/2},${height/2})`);

      g.selectAll("text")
        .data(words)
        .enter().append("text")
        .style("font-size", d => `${d.size}px`)
        .style("fill", (_, i) => d3.schemeCategory10[i % 10])
        .attr("text-anchor", "middle")
        .attr("transform", d => `translate(${d.x || 0},${d.y || 0}) rotate(${d.rotate || 0})`)
        .text(d => d.text);
    }
  }, [keywords]);

  return (
    <svg 
      ref={svgRef} 
      style={{ width: '100%', height: '100%' }}
    />
  );
}; 