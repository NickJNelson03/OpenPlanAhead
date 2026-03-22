import pandas as pd

# Read fixed-width text file
df = pd.read_fwf("./data/fall_2026.txt")

# Save as CSV
df.to_csv("fall_2026.csv", index=False)

print(df.head())
print("Converted to courses.csv")