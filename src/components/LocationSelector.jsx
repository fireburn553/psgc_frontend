// src/components/LocationSelectorModal.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import "./Modal.css"; // We'll add a small CSS file

const API_BASE = "http://127.0.0.1:8000/api"; // Change to your API URL

export default function LocationSelectorModal() {
  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities_municipalities, setCitiesMunicipalities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [subMunicipalities, setSubMunicipalities] = useState([]);

  const [selectedSubMunicipality, setSelectedSubMunicipality] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCityMunicipality, setSelectedCity] = useState("");
  const [selectedBarangay, setSelectedBarangay] = useState("");

  const [isOpen, setIsOpen] = useState(false);

  // Load regions
  useEffect(() => {
    axios
      .get(`${API_BASE}/regions`)
      .then((res) => {
        const mappedRegions = res.data.map((r) => ({
          code: r["10-digit PSGC"],
          name: r["Name"],
        }));
        setRegions(mappedRegions);
      })
      .catch((err) => console.error("❌ Error loading regions:", err));
  }, []);

  // Load provinces
  useEffect(() => {
    if (selectedRegion) {
      axios
        .get(`${API_BASE}/provinces?region_code=${selectedRegion}`)
        .then((res) => {
          const mappedProvinces = res.data.map((r) => ({
            code: r["10-digit PSGC"],
            name: r["Name"],
          }));
          setProvinces(mappedProvinces);

          if (mappedProvinces.length === 0) {
            axios
              .get(`${API_BASE}/citi_muni?region_code=${selectedRegion}`)
              .then((cityRes) => {
                const mappedCities = cityRes.data.map((r) => ({
                  code: r["10-digit PSGC"],
                  name: r["Name"],
                }));
                setCitiesMunicipalities(mappedCities);
              });
          }
        });
    }
  }, [selectedRegion]);

  // Load cities
  useEffect(() => {
    if (selectedProvince) {
      axios
        .get(`${API_BASE}/citi_muni?province_code=${selectedProvince}`)
        .then((res) => {
          const mappedCities = res.data.map((r) => ({
            code: r["10-digit PSGC"],
            name: r["Name"],
          }));
          setCitiesMunicipalities(mappedCities);
        });
    }
  }, [selectedProvince]);

  // Load sub-muni or barangays
  useEffect(() => {
    if (selectedCityMunicipality) {
      axios
        .get(`${API_BASE}/sub_muni?city_code=${selectedCityMunicipality}`)
        .then((res) => {
          if (res.data.length > 0) {
            setSubMunicipalities(res.data);
          } else {
            setSubMunicipalities([]);
            axios
              .get(
                `${API_BASE}/barangays?municipality_code=${selectedCityMunicipality}`
              )
              .then((res) => {
                const mappedBarangay = res.data.map((r) => ({
                  code: r["10-digit PSGC"],
                  name: r["Name"],
                }));
                setBarangays(mappedBarangay);
              });
          }
        });
    }
  }, [selectedCityMunicipality]);

  // Load barangays for sub-muni
  useEffect(() => {
    if (selectedSubMunicipality) {
      axios
        .get(
          `${API_BASE}/barangays?municipality_code=${selectedSubMunicipality}`
        )
        .then((res) => {
          const mappedBarangay = res.data.map((r) => ({
            code: r["10-digit PSGC"],
            name: r["Name"],
          }));
          setBarangays(mappedBarangay);
        });
    }
  }, [selectedSubMunicipality]);

  return (
    <div className="location-selector">
      {/* Trigger Button */}
      <button className="open-btn" onClick={() => setIsOpen(true)}>
        Select Location
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">📍 Location Selector</h3>

            {/* Region */}
            <label>Region:</label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              <option value="">-- Select Region --</option>
              {regions.map((region) => (
                <option key={region.code} value={region.code}>
                  {region.name}
                </option>
              ))}
            </select>

            {/* Province */}
            <label>Province:</label>
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
            >
              <option value="">-- Select Province --</option>
              {provinces.map((prov) => (
                <option key={prov.code} value={prov.code}>
                  {prov.name}
                </option>
              ))}
            </select>

            {/* City/Municipality */}
            <label>City/Municipality:</label>
            <select
              value={selectedCityMunicipality}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              <option value="">-- Select City/Municipality --</option>
              {cities_municipalities.map((city) => (
                <option key={city.code} value={city.code}>
                  {city.name}
                </option>
              ))}
            </select>

            {/* Sub-Municipality */}
            {subMunicipalities.length > 0 && (
              <>
                <label>Sub-Municipality:</label>
                <select
                  value={selectedSubMunicipality}
                  onChange={(e) => setSelectedSubMunicipality(e.target.value)}
                >
                  <option value="">-- Select Sub-Municipality --</option>
                  {subMunicipalities.map((sub) => (
                    <option
                      key={sub["10-digit PSGC"]}
                      value={sub["10-digit PSGC"]}
                    >
                      {sub.Name}
                    </option>
                  ))}
                </select>
              </>
            )}

            {/* Barangay */}
            <label>Barangay:</label>
            <select
              value={selectedBarangay}
              onChange={(e) => setSelectedBarangay(e.target.value)}
            >
              <option value="">-- Select Barangay --</option>
              {barangays.map((brgy) => (
                <option key={brgy.code} value={brgy.code}>
                  {brgy.name}
                </option>
              ))}
            </select>

            {/* Actions */}
            <div className="modal-actions">
              <button className="close-btn" onClick={() => setIsOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
