import CloudBackground from '@/components/CloudBackground';
import Header from '@/components/Header';
import TodoList from '@/components/TodoList';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div className="min-h-screen relative">
      <CloudBackground />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Header />
        <TodoList />
      </div>
    </div>
  );
}
