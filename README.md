# CrossFit Leaderboard Application

A React application for tracking and managing CrossFit workout scores and athlete rankings with real-time updates.

## Features

- View athlete rankings for different workouts
- Filter athletes by division (RX, Scaled, Masters)
- Add new athletes
- Add new workouts
- Record and update scores
- Validate scores
- Real-time updates using Supabase

## Technologies Used

- React
- TypeScript
- Tailwind CSS
- Vite
- Supabase (for database and real-time updates)

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Supabase account (free tier available at [supabase.com](https://supabase.com))

### Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Copy your Supabase URL and anon key from the project settings
3. Add these credentials to your `.env` file (see Configuration section)
4. Execute the SQL script from `supabase-schema.sql` in the Supabase SQL editor to create the tables and sample data

### Installation

1. Clone the repository
2. Install dependencies

```bash
npm install
# or
yarn
```

### Configuration

Create a `.env` file in the root directory with the following variables:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Replace `your-supabase-url` and `your-supabase-anon-key` with the credentials from your Supabase project.

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at http://localhost:5173

### Build

To build the application for production:

```bash
npm run build
# or
yarn build
```

### Preview

To preview the production build:

```bash
npm run preview
# or
yarn preview
```

## Database Schema

The application uses two main tables in Supabase:

### athletes
- id (serial, primary key)
- name (text)
- division (text: 'RX', 'Scaled', 'Masters', 'Teens')
- gender (text: 'M', 'F')
- age (integer)
- created_at (timestamp)

### workouts
- id (serial, primary key)
- name (text)
- description (text)
- scoreType (text: 'time', 'reps', 'weight')
- scores (jsonb) - A JSON object with athlete IDs as keys and score objects as values
- created_at (timestamp)

## License

ISC 