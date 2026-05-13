import { AppProvider } from './app/AppProvider';
import { VestDashboard } from './screens/VestDashboard';

export default function App() {
  return (
    <AppProvider>
      <VestDashboard />
    </AppProvider>
  );
}
