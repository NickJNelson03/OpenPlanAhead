import pandas as pd
from pathlib import Path

file_path = Path("./data/raw/fall_2026.txt")
output_path = Path("./data/processed/courses_cleaned.csv")

# Read fixed-width file
df = pd.read_fwf(file_path)

# Rename columns
df.columns = [
    "term","crn","subject","course_number","title",
    "unit_value","credits","instruction_mode","days","time",
    "additional_days","additional_time","p","limit","enrolled","instructor"
]

# Remove header/separator rows
df = df[df["term"].astype(str).str.fullmatch(r"\d+")]
df = df.reset_index(drop=True)

# Clean text fields
for col in ["title","instruction_mode","days","additional_days","additional_time"]:
    df[col] = df[col].astype(str).str.strip()

# =========================
# FIX INSTRUCTOR FIELD
# =========================
df["instructor"] = df["instructor"].astype(str)\
    .str.replace('"', '', regex=False)\
    .str.replace(r',\s*,*$', '', regex=True)\
    .str.replace(',', ' ', regex=False)\
    .str.strip()

# =========================
# SPLIT TIME (NO EXTRA 0s)
# =========================
time_split = df["time"].astype(str).str.extract(r"(?P<start>\d{4})-(?P<end>\d{4})")

# Convert to HH:MM (NOT HH:MM:SS)
df["start_time"] = pd.to_datetime(time_split["start"], format="%H%M", errors="coerce").dt.strftime("%H:%M")
df["end_time"] = pd.to_datetime(time_split["end"], format="%H%M", errors="coerce").dt.strftime("%H:%M")

# =========================
# NUMERIC CLEANING
# =========================
df["term"] = pd.to_numeric(df["term"], errors="coerce")
df["crn"] = pd.to_numeric(df["crn"], errors="coerce")
df["unit_value"] = pd.to_numeric(df["unit_value"], errors="coerce")
df["credits"] = pd.to_numeric(df["credits"], errors="coerce")
df["seats_available"] = pd.to_numeric(df["limit"], errors="coerce")

# Replace junk values
df = df.replace({"-": None, "": None})

# =========================
# FINAL DATASET
# =========================
clean_df = df[[
    "term","crn","subject","course_number","title",
    "unit_value","credits","instruction_mode","days",
    "start_time","end_time","additional_days","additional_time",
    "seats_available","instructor"
]]

# Save
output_path.parent.mkdir(parents=True, exist_ok=True)
clean_df.to_csv(output_path, index=False)

print("Saved to:", output_path)
print(clean_df.head(10))