# ASC v0.4.3.1 — Sensorzuordnung

Aus der hochgeladenen ZIP extrahiert. Keine ASC-Quelldateien werden weiterverteilt. IDs aus Sensor-Namen sind erwartete HA-IDs, keine Garantie nach Umbenennung. Vollständige Daten inklusive data_key/state_key im JSON-Inventar.

## Live- und Anlagenmessung

| Rolle | Entity | Beleg / Einschränkung |
|---|---|---|
| PV-Leistung | sensor.solar_watt_aktuell | const.py; Definition des externen Sensors fehlt |
| DC-Spannung | sensor.solar_average_voltage | const.py und Dashboard |
| Batterie-Strom | sensor.solar_complete_ampere | const.py und Dashboard; positiv Laden |
| Batterie-Leistung | V × A | ASC-Vorgabe battery_power_sensor leer; optional separater Sensor |
| Inverter AC | sensor.apsystems_output_average | const.py Inverter-Istwert |
| Alternative AC-Anzeige | sensor.input_solar_power | Dashboard; nicht gleichzeitig addieren |
| Netzleistung | sensor.e320_power_in | const.py und Dashboard |
| PV heute | sensor.solar_tageserzeugung | const.py; externe Definition nicht mitgeliefert |
| solar_tagesverbrauch | sensor.solar_tagesverbrauch | Messgrenze nicht definiert; nicht automatisch zugeordnet |
| Inverter/Netz-Energie | nicht eindeutig vorhanden | eigene Zähler konfigurieren |

Die fünf EPEVER-PV-Array-Sensoren sind Eingangsmessungen vor möglichen MPPT-Verlusten. Keine DC-Bus-Leistungsbilanz aus ungleichen Messgrenzen bilden. solar_akku_entladeleistung ist eine einseitige Entladeanzeige und kein vorzeichenbehafteter Batteriesensor. solar_entladephase_kwh ist ein Phasenwert, kein fortlaufender Energieflusszähler. ASC actual_pv_today und Prognosen haben keinen Summen-state_class.

## Sämtliche ASC-Sensoren

| Schlüssel | Name / erwartete Entity-ID | Einheit | Statistikklasse | YAML belegt |
|---|---|---|---|---|
| battery_energy_charged_total | Battery Energy Charged Total<br>`sensor.adaptive_solar_controller_battery_energy_charged_total` | UnitOfEnergy.KILO_WATT_HOUR | SensorStateClass.TOTAL_INCREASING | abgeleitet |
| battery_energy_discharged_total | Battery Energy Discharged Total<br>`sensor.adaptive_solar_controller_battery_energy_discharged_total` | UnitOfEnergy.KILO_WATT_HOUR | SensorStateClass.TOTAL_INCREASING | abgeleitet |
| recommended_target | Recommended target<br>`sensor.adaptive_solar_controller_recommended_target` | UnitOfPower.WATT | keine | ja |
| applied_target | Applied target<br>`sensor.adaptive_solar_controller_applied_target` | UnitOfPower.WATT | keine | ja |
| effective_limit | Effective inverter limit<br>`sensor.adaptive_solar_controller_effective_inverter_limit` | UnitOfPower.WATT | keine | ja |
| grid_error | Grid target error<br>`sensor.adaptive_solar_controller_grid_target_error` | UnitOfPower.WATT | keine | ja |
| raw_target | Theoretical raw target<br>`sensor.adaptive_solar_controller_theoretical_raw_target` | UnitOfPower.WATT | keine | abgeleitet |
| export_escalation | Export escalation<br>`sensor.adaptive_solar_controller_export_escalation` | — | keine | ja |
| deadband_negative | Adaptive deadband export side<br>`sensor.adaptive_solar_controller_adaptive_deadband_export_side` | UnitOfPower.WATT | keine | ja |
| deadband_positive | Adaptive deadband import side<br>`sensor.adaptive_solar_controller_adaptive_deadband_import_side` | UnitOfPower.WATT | keine | ja |
| deadband_maturity | Deadband learning maturity<br>`sensor.adaptive_solar_controller_deadband_learning_maturity` | PERCENTAGE | keine | abgeleitet |
| minimum_useful_delta | Learned minimum useful target change<br>`sensor.adaptive_solar_controller_learned_minimum_useful_target_change` | UnitOfPower.WATT | keine | abgeleitet |
| jump_confidence | Jump response confidence<br>`sensor.adaptive_solar_controller_jump_response_confidence` | PERCENTAGE | keine | abgeleitet |
| jump_target | Learned jump target<br>`sensor.adaptive_solar_controller_learned_jump_target` | UnitOfPower.WATT | keine | abgeleitet |
| response_learning_eligible | Response learning eligible<br>`sensor.adaptive_solar_controller_response_learning_eligible` | — | keine | abgeleitet |
| saturation_reason | Response learning skip reason<br>`sensor.adaptive_solar_controller_response_learning_skip_reason` | — | keine | abgeleitet |
| response_samples | Response learning samples<br>`sensor.adaptive_solar_controller_response_learning_samples` | — | keine | abgeleitet |
| learned_gain | Learned response gain<br>`sensor.adaptive_solar_controller_learned_response_gain` | — | keine | ja |
| predicted_load | Predicted load<br>`sensor.adaptive_solar_controller_predicted_load` | UnitOfPower.WATT | keine | ja |
| current_load | Estimated house load<br>`sensor.adaptive_solar_controller_estimated_house_load` | UnitOfPower.WATT | keine | abgeleitet |
| confidence | Prediction confidence<br>`sensor.adaptive_solar_controller_prediction_confidence` | PERCENTAGE | keine | ja |
| prediction_maturity | Prediction maturity<br>`sensor.adaptive_solar_controller_prediction_maturity` | — | keine | ja |
| prediction_eval_samples | Prediction validation samples<br>`sensor.adaptive_solar_controller_prediction_validation_samples` | — | keine | abgeleitet |
| learning_samples | Learning samples<br>`sensor.adaptive_solar_controller_learning_samples` | — | keine | abgeleitet |
| learned_buckets | Learned time buckets<br>`sensor.adaptive_solar_controller_learned_time_buckets` | — | keine | abgeleitet |
| forecast_trust | Solar forecast trust<br>`sensor.adaptive_solar_controller_solar_forecast_trust` | PERCENTAGE | keine | ja |
| forecast_bias | Solar forecast correction factor<br>`sensor.adaptive_solar_controller_solar_forecast_correction_factor` | — | keine | ja |
| forecast_reputation | Solar forecast reputation<br>`sensor.adaptive_solar_controller_solar_forecast_reputation` | — | keine | ja |
| corrected_forecast_remaining | Corrected PV forecast remaining today<br>`sensor.adaptive_solar_controller_corrected_pv_forecast_remaining_today` | UnitOfEnergy.KILO_WATT_HOUR | keine | abgeleitet |
| corrected_forecast_tomorrow | Corrected PV forecast tomorrow<br>`sensor.adaptive_solar_controller_corrected_pv_forecast_tomorrow` | UnitOfEnergy.KILO_WATT_HOUR | keine | abgeleitet |
| seasonal_expected_today | Seasonal expected PV today<br>`sensor.adaptive_solar_controller_seasonal_expected_pv_today` | UnitOfEnergy.KILO_WATT_HOUR | keine | abgeleitet |
| seasonal_expected_tomorrow | Seasonal expected PV tomorrow<br>`sensor.adaptive_solar_controller_seasonal_expected_pv_tomorrow` | UnitOfEnergy.KILO_WATT_HOUR | keine | abgeleitet |
| seasonal_confidence | Seasonal confidence<br>`sensor.adaptive_solar_controller_seasonal_confidence` | PERCENTAGE | keine | ja |
| seasonal_history_days | Seasonal history days<br>`sensor.adaptive_solar_controller_seasonal_history_days` | — | keine | abgeleitet |
| battery_full_confidence | Battery full confidence<br>`sensor.adaptive_solar_controller_battery_full_confidence` | PERCENTAGE | keine | ja |
| full_charge_voltage | Learned full charge voltage<br>`sensor.adaptive_solar_controller_learned_full_charge_voltage` | UnitOfElectricPotential.VOLT | keine | ja |
| full_transition_voltage | Learned full transition voltage<br>`sensor.adaptive_solar_controller_learned_full_transition_voltage` | UnitOfElectricPotential.VOLT | keine | ja |
| relaxation_drop | Battery full relaxation drop<br>`sensor.adaptive_solar_controller_battery_full_relaxation_drop` | UnitOfElectricPotential.VOLT | keine | ja |
| transition_confidence | Full transition confidence<br>`sensor.adaptive_solar_controller_full_transition_confidence` | PERCENTAGE | keine | ja |
| battery_reserve | Estimated battery reserve<br>`sensor.adaptive_solar_controller_estimated_battery_reserve` | PERCENTAGE | keine | ja |
| battery_recovery_state | Battery recovery state<br>`sensor.adaptive_solar_controller_battery_recovery_state` | — | keine | ja |
| battery_recovery_need | Battery recovery need<br>`sensor.adaptive_solar_controller_battery_recovery_need` | PERCENTAGE | keine | ja |
| pv_charge_state | PV charge phase<br>`sensor.adaptive_solar_controller_pv_charge_phase` | — | keine | ja |
| calibration_state | Battery calibration state<br>`sensor.adaptive_solar_controller_battery_calibration_state` | — | keine | ja |
| expected_total_need | Learned total energy until next PV charge<br>`sensor.adaptive_solar_controller_learned_total_energy_until_next_pv_charge` | UnitOfEnergy.KILO_WATT_HOUR | keine | ja |
| learned_battery_gap | Learned battery energy until next PV charge<br>`sensor.adaptive_solar_controller_learned_battery_energy_until_next_pv_charge` | UnitOfEnergy.KILO_WATT_HOUR | keine | ja |
| learned_grid_gap | Learned grid energy until next PV charge<br>`sensor.adaptive_solar_controller_learned_grid_energy_until_next_pv_charge` | UnitOfEnergy.KILO_WATT_HOUR | keine | ja |
| current_gap_total | Current energy since PV charge end<br>`sensor.adaptive_solar_controller_current_energy_since_pv_charge_end` | UnitOfEnergy.KILO_WATT_HOUR | keine | ja |
| battery_demand_confidence | Energy demand learning confidence<br>`sensor.adaptive_solar_controller_energy_demand_learning_confidence` | PERCENTAGE | keine | ja |
| energy_budget | Battery energy budget<br>`sensor.adaptive_solar_controller_battery_energy_budget` | UnitOfEnergy.KILO_WATT_HOUR | keine | ja |
| energy_budget_state | Battery energy budget state<br>`sensor.adaptive_solar_controller_battery_energy_budget_state` | — | keine | ja |
| energy_budget_confidence | Battery energy budget confidence<br>`sensor.adaptive_solar_controller_battery_energy_budget_confidence` | PERCENTAGE | keine | abgeleitet |
| target_reserve | Target reserve at next PV charge<br>`sensor.adaptive_solar_controller_target_reserve_at_next_pv_charge` | PERCENTAGE | keine | ja |
| planner_reason | Energy planner reason<br>`sensor.adaptive_solar_controller_energy_planner_reason` | — | keine | ja |
| stored_energy | Estimated stored battery energy<br>`sensor.adaptive_solar_controller_estimated_stored_battery_energy` | UnitOfEnergy.KILO_WATT_HOUR | keine | ja |
| usable_capacity | Learned usable battery capacity<br>`sensor.adaptive_solar_controller_learned_usable_battery_capacity` | UnitOfEnergy.KILO_WATT_HOUR | keine | ja |
| capacity_confidence | Battery capacity confidence<br>`sensor.adaptive_solar_controller_battery_capacity_confidence` | PERCENTAGE | keine | ja |
| energy_state_confidence | Battery energy state confidence<br>`sensor.adaptive_solar_controller_battery_energy_state_confidence` | PERCENTAGE | keine | ja |
| energy_delta | Battery energy delta last sample<br>`sensor.adaptive_solar_controller_battery_energy_delta_last_sample` | UnitOfEnergy.KILO_WATT_HOUR | keine | abgeleitet |
| measurement_quality | Battery measurement quality<br>`sensor.adaptive_solar_controller_battery_measurement_quality` | — | keine | ja |
| typical_gap_energy | Typical energy demand until next PV charge<br>`sensor.adaptive_solar_controller_typical_energy_demand_until_next_pv_charge` | UnitOfEnergy.KILO_WATT_HOUR | keine | ja |
| recent_gap_energy | Recent energy demand until next PV charge<br>`sensor.adaptive_solar_controller_recent_energy_demand_until_next_pv_charge` | UnitOfEnergy.KILO_WATT_HOUR | keine | ja |
| last_gap_classification | Last demand gap classification<br>`sensor.adaptive_solar_controller_last_demand_gap_classification` | — | keine | ja |
| available_surplus_power | Available surplus power<br>`sensor.adaptive_solar_controller_available_surplus_power` | UnitOfPower.WATT | keine | ja |
| available_surplus_energy | Available surplus energy<br>`sensor.adaptive_solar_controller_available_surplus_energy` | UnitOfEnergy.KILO_WATT_HOUR | keine | ja |
| surplus_confidence | Surplus confidence<br>`sensor.adaptive_solar_controller_surplus_confidence` | PERCENTAGE | keine | ja |
| progressive_gamma | Progressive release gamma<br>`sensor.adaptive_solar_controller_progressive_release_gamma` | — | keine | ja |
| progressive_release_factor | Progressive release factor<br>`sensor.adaptive_solar_controller_progressive_release_factor` | PERCENTAGE | keine | abgeleitet |
| battery_power_envelope | Battery power envelope<br>`sensor.adaptive_solar_controller_battery_power_envelope` | UnitOfPower.WATT | keine | ja |
| power_envelope_confidence | Battery power envelope confidence<br>`sensor.adaptive_solar_controller_battery_power_envelope_confidence` | PERCENTAGE | keine | abgeleitet |
| planning_confidence | Planning confidence<br>`sensor.adaptive_solar_controller_planning_confidence` | PERCENTAGE | keine | ja |
| planning_reserve_adjustment | Learned planning reserve adjustment<br>`sensor.adaptive_solar_controller_learned_planning_reserve_adjustment` | PERCENTAGE | keine | ja |
| planner_evaluation | Last planner self evaluation<br>`sensor.adaptive_solar_controller_last_planner_self_evaluation` | — | keine | ja |
| horizon_24h_balance | Energy horizon 24h balance<br>`sensor.adaptive_solar_controller_energy_horizon_24h_balance` | UnitOfEnergy.KILO_WATT_HOUR | keine | ja |
| horizon_48h_balance | Energy horizon 48h balance<br>`sensor.adaptive_solar_controller_energy_horizon_48h_balance` | UnitOfEnergy.KILO_WATT_HOUR | keine | ja |
| horizon_72h_balance | Energy horizon 72h balance<br>`sensor.adaptive_solar_controller_energy_horizon_72h_balance` | UnitOfEnergy.KILO_WATT_HOUR | keine | ja |
| corrected_forecast_today_total | Corrected PV forecast today total<br>`sensor.adaptive_solar_controller_corrected_pv_forecast_today_total` | UnitOfEnergy.KILO_WATT_HOUR | keine | ja |
| actual_pv_today | Actual PV production today<br>`sensor.adaptive_solar_controller_actual_pv_production_today` | UnitOfEnergy.KILO_WATT_HOUR | keine | ja |
| flight_recorder_path | Flight recorder file<br>`sensor.adaptive_solar_controller_flight_recorder_file` | — | keine | ja |
| events | ASC event marker<br>`sensor.adaptive_solar_controller_asc_event_marker` | — | keine | ja |
| controller_state | Controller state<br>`sensor.adaptive_solar_controller_controller_state` | — | keine | ja |
| blocked_reason | Blocked reason<br>`sensor.adaptive_solar_controller_blocked_reason` | — | keine | abgeleitet |

## Alle Dashboard-Entities (einschließlich Steuerungen / externe Sensoren)

Diese Liste dokumentiert die Referenz, sie aktiviert keine Steuerungen. Schalter, Nummern und Auswahllisten werden von der kleinen Karte nicht bedient.

- `binary_sensor.adaptive_solar_controller_energy_surplus_available`
- `input_boolean.solar_entladephase`
- `input_datetime.solar_entladephase_start`
- `input_number.battery_voltage_high`
- `input_number.battery_voltage_low`
- `input_number.inverter_max_limit`
- `input_number.inverter_target_power`
- `input_number.solar_entladephase_startspannung`
- `input_number.solar_letzte_entladung_ah`
- `input_number.solar_letzte_entladung_kwh`
- `number.adaptive_solar_controller_battery_usable_capacity_start`
- `number.apsystems_apsystems_1_max_output_power`
- `number.ez1_backup_apsystems_ez1_backup_max_output_power`
- `select.adaptive_solar_controller_battery_chemistry`
- `sensor.adaptive_solar_controller_actual_pv_production_today`
- `sensor.adaptive_solar_controller_adaptive_deadband_export_side`
- `sensor.adaptive_solar_controller_adaptive_deadband_import_side`
- `sensor.adaptive_solar_controller_applied_target`
- `sensor.adaptive_solar_controller_asc_event_marker`
- `sensor.adaptive_solar_controller_available_surplus_energy`
- `sensor.adaptive_solar_controller_available_surplus_power`
- `sensor.adaptive_solar_controller_battery_calibration_state`
- `sensor.adaptive_solar_controller_battery_capacity_confidence`
- `sensor.adaptive_solar_controller_battery_energy_budget`
- `sensor.adaptive_solar_controller_battery_energy_budget_state`
- `sensor.adaptive_solar_controller_battery_energy_state_confidence`
- `sensor.adaptive_solar_controller_battery_full_confidence`
- `sensor.adaptive_solar_controller_battery_full_relaxation_drop`
- `sensor.adaptive_solar_controller_battery_measurement_quality`
- `sensor.adaptive_solar_controller_battery_power_envelope`
- `sensor.adaptive_solar_controller_battery_recovery_need`
- `sensor.adaptive_solar_controller_battery_recovery_state`
- `sensor.adaptive_solar_controller_controller_state`
- `sensor.adaptive_solar_controller_corrected_pv_forecast_today_total`
- `sensor.adaptive_solar_controller_current_energy_since_pv_charge_end`
- `sensor.adaptive_solar_controller_effective_inverter_limit`
- `sensor.adaptive_solar_controller_energy_demand_learning_confidence`
- `sensor.adaptive_solar_controller_energy_horizon_24h_balance`
- `sensor.adaptive_solar_controller_energy_horizon_48h_balance`
- `sensor.adaptive_solar_controller_energy_horizon_72h_balance`
- `sensor.adaptive_solar_controller_energy_planner_reason`
- `sensor.adaptive_solar_controller_estimated_battery_reserve`
- `sensor.adaptive_solar_controller_estimated_stored_battery_energy`
- `sensor.adaptive_solar_controller_export_escalation`
- `sensor.adaptive_solar_controller_flight_recorder_file`
- `sensor.adaptive_solar_controller_full_transition_confidence`
- `sensor.adaptive_solar_controller_grid_target_error`
- `sensor.adaptive_solar_controller_last_demand_gap_classification`
- `sensor.adaptive_solar_controller_last_planner_self_evaluation`
- `sensor.adaptive_solar_controller_learned_battery_energy_until_next_pv_charge`
- `sensor.adaptive_solar_controller_learned_full_charge_voltage`
- `sensor.adaptive_solar_controller_learned_full_transition_voltage`
- `sensor.adaptive_solar_controller_learned_grid_energy_until_next_pv_charge`
- `sensor.adaptive_solar_controller_learned_planning_reserve_adjustment`
- `sensor.adaptive_solar_controller_learned_response_gain`
- `sensor.adaptive_solar_controller_learned_total_energy_until_next_pv_charge`
- `sensor.adaptive_solar_controller_learned_usable_battery_capacity`
- `sensor.adaptive_solar_controller_planning_confidence`
- `sensor.adaptive_solar_controller_predicted_load`
- `sensor.adaptive_solar_controller_prediction_confidence`
- `sensor.adaptive_solar_controller_prediction_maturity`
- `sensor.adaptive_solar_controller_progressive_release_gamma`
- `sensor.adaptive_solar_controller_pv_charge_phase`
- `sensor.adaptive_solar_controller_recent_energy_demand_until_next_pv_charge`
- `sensor.adaptive_solar_controller_recommended_target`
- `sensor.adaptive_solar_controller_seasonal_confidence`
- `sensor.adaptive_solar_controller_solar_forecast_correction_factor`
- `sensor.adaptive_solar_controller_solar_forecast_reputation`
- `sensor.adaptive_solar_controller_solar_forecast_trust`
- `sensor.adaptive_solar_controller_surplus_confidence`
- `sensor.adaptive_solar_controller_target_reserve_at_next_pv_charge`
- `sensor.adaptive_solar_controller_typical_energy_demand_until_next_pv_charge`
- `sensor.e320_power_in`
- `sensor.energy_production_today_remaining_2`
- `sensor.energy_production_tomorrow_2`
- `sensor.epever_tracer1_charge_state`
- `sensor.epever_tracer2_charge_state`
- `sensor.epever_tracer3_charge_state`
- `sensor.epever_tracer4_charge_state`
- `sensor.epever_tracer5_charge_state`
- `sensor.epever_tracer_1_battery_current`
- `sensor.epever_tracer_1_battery_voltage`
- `sensor.epever_tracer_1_charging_current`
- `sensor.epever_tracer_1_generated_energy_today`
- `sensor.epever_tracer_1_load_current`
- `sensor.epever_tracer_1_maximum_battery_voltage_today`
- `sensor.epever_tracer_1_minimum_battery_voltage_today`
- `sensor.epever_tracer_1_pv_array_input_power`
- `sensor.epever_tracer_1_pv_array_input_voltage`
- `sensor.epever_tracer_2_battery_current`
- `sensor.epever_tracer_2_battery_voltage`
- `sensor.epever_tracer_2_charging_current`
- `sensor.epever_tracer_2_generated_energy_today`
- `sensor.epever_tracer_2_load_current`
- `sensor.epever_tracer_2_maximum_battery_voltage_today`
- `sensor.epever_tracer_2_minimum_battery_voltage_today`
- `sensor.epever_tracer_2_pv_array_input_power`
- `sensor.epever_tracer_2_pv_array_input_voltage`
- `sensor.epever_tracer_3_battery_current`
- `sensor.epever_tracer_3_battery_voltage`
- `sensor.epever_tracer_3_charging_current`
- `sensor.epever_tracer_3_generated_energy_today`
- `sensor.epever_tracer_3_maximum_battery_voltage_today`
- `sensor.epever_tracer_3_minimum_battery_voltage_today`
- `sensor.epever_tracer_3_pv_array_input_power`
- `sensor.epever_tracer_3_pv_array_input_voltage`
- `sensor.epever_tracer_4_battery_current`
- `sensor.epever_tracer_4_battery_voltage`
- `sensor.epever_tracer_4_charging_current`
- `sensor.epever_tracer_4_generated_energy_today`
- `sensor.epever_tracer_4_maximum_battery_voltage_today`
- `sensor.epever_tracer_4_minimum_battery_voltage_today`
- `sensor.epever_tracer_4_pv_array_input_power`
- `sensor.epever_tracer_4_pv_array_input_voltage`
- `sensor.epever_tracer_5_battery_current`
- `sensor.epever_tracer_5_battery_voltage`
- `sensor.epever_tracer_5_charging_current`
- `sensor.epever_tracer_5_generated_energy_today`
- `sensor.epever_tracer_5_maximum_battery_voltage_today`
- `sensor.epever_tracer_5_minimum_battery_voltage_today`
- `sensor.epever_tracer_5_pv_array_input_power`
- `sensor.epever_tracer_5_pv_array_input_voltage`
- `sensor.input_solar_power`
- `sensor.inverter_abweichung_durchschnitt`
- `sensor.jahres_effizienz_akkusystem`
- `sensor.jahres_effizienz_invertersystem`
- `sensor.jahres_effizienz_solarsystem`
- `sensor.netzfrequenz`
- `sensor.power_production_next_12hours_2`
- `sensor.shelly_pm_2_voltage`
- `sensor.solar_akku_entladeleistung`
- `sensor.solar_akku_entladestrom`
- `sensor.solar_average_voltage`
- `sensor.solar_complete_ampere`
- `sensor.solar_entladephase_ah`
- `sensor.solar_entladephase_kwh`
- `sensor.solar_jahreserzeugung`
- `sensor.solar_jahresverbrauch`
- `sensor.solar_tageserzeugung`
- `sensor.solar_tagesverbrauch`
- `sensor.solar_yield_overview`
- `sensor.solar_yield_year`
- `sensor.sun_solar_elevation`
- `sun.sun`
- `switch.adaptive_solar_controller_14_day_flight_recorder`
- `switch.adaptive_solar_controller_battery_calibration`
- `switch.adaptive_solar_controller_controller_enabled`
- `switch.input_solar`
