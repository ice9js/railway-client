"use client"

import { useState } from 'react';

import Project from '~/components/project';
import Welcome from '~/components/welcome';

export default function RailwayClient() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white text-black">
      <Welcome />
      <Project />
    </main>
  );
}
