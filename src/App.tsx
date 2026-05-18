import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import FcffSimpleDcf from './pages/FcffSimpleDcf'
import FcffFullDcf from './pages/FcffFullDcf'
import HighGrowthValuation from './pages/HighGrowthValuation'
import ModelSelector from './pages/ModelSelector'
import WaccCalculator from './pages/WaccCalculator'
import ImpliedRocRoe from './pages/ImpliedRocRoe'
import ImpliedErp from './pages/ImpliedErp'
import RdConverter from './pages/RdConverter'
import OperatingLeaseConverter from './pages/OperatingLeaseConverter'
import NormalizedEarnings from './pages/NormalizedEarnings'
import CountryRisk from './pages/CountryRisk'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="fcff-simple" element={<FcffSimpleDcf />} />
        <Route path="fcff-full" element={<FcffFullDcf />} />
        <Route path="high-growth" element={<HighGrowthValuation />} />
        <Route path="model-selector" element={<ModelSelector />} />
        <Route path="wacc" element={<WaccCalculator />} />
        <Route path="implied-roc-roe" element={<ImpliedRocRoe />} />
        <Route path="implied-erp" element={<ImpliedErp />} />
        <Route path="rd-converter" element={<RdConverter />} />
        <Route path="operating-lease" element={<OperatingLeaseConverter />} />
        <Route path="normalized-earnings" element={<NormalizedEarnings />} />
        <Route path="country-risk" element={<CountryRisk />} />
      </Route>
    </Routes>
  )
}
