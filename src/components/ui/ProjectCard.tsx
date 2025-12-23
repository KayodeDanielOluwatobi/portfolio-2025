'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Squircle } from '@squircle-js/react';
import { useState } from 'react';

interface ProjectCardProps {
  title: string;
  slug: string;
  media: string;
  type: 'image' | 'gif' | 'video';
  aspectRatio?: 'square' | 'auto';
  cornerRadius?: number;
}

export default function ProjectCard({ title, slug, media, type, cornerRadius = 30, aspectRatio = 'square' }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <Link href={`/works/${slug}`}>
      <Squircle
        cornerRadius={cornerRadius}
        cornerSmoothing={0.7}
        className={`relative overflow-hidden cursor-pointer ${
          aspectRatio === 'square' ? 'aspect-square' : ''
        }`}
        style={{ background: 'transparent' }}
        aria-label={title}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Loading Placeholder */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-white/5 animate-pulse" />
        )}

        {/* Image */}
        {type === 'image' && (
          aspectRatio === 'square' ? (
            <Image
              src={media}
              alt={title}
              fill
              priority={false}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8VAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k="
              className={`object-cover transition-all duration-700 ease-out ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              } ${
                isHovered ? 'scale-105' : 'scale-100'
              }`}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onLoadingComplete={() => setIsLoaded(true)}
            />
          ) : (
            <img
              src={media}
              alt={title}
              onLoad={() => setIsLoaded(true)}
              className={`w-full h-auto object-cover transition-all duration-700 ease-out ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              } ${
                isHovered ? 'scale-105' : 'scale-100'
              }`}
            />
          )
        )}

        {/* GIF */}
        {type === 'gif' && (
          <img
            src={media}
            alt={title}
            onLoad={() => setIsLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-700 ease-out ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            } ${
              isHovered ? 'scale-110' : 'scale-100'
            }`}
          />
        )}

        {/* Video */}
        {type === 'video' && (
          <video
            src={media}
            autoPlay
            muted
            loop
            onLoadedData={() => setIsLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-700 ease-out ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            } ${
              isHovered ? 'scale-110' : 'scale-100'
            }`}
          />
        )}
        {/* Overlay on hover */}
        {/* <div
          className={`absolute inset-0 transition-colors duration-300 ${
            isHovered ? 'bg-black/10' : 'bg-black/0'
          }`}
        /> */}
      </Squircle>
    </Link>
  );
}