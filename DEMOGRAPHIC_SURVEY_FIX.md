# Demographic Survey - One Per Participant Number

## 🔄 **Updated Behavior**

The demographic survey is now correctly implemented to be taken **ONCE per participant number** globally, not per device or app installation.

## 📋 **How It Works**

### **Before (Device-Based)**
- Survey completion tracked by `demographic_survey_completed` flag in `participants` table
- Each device/installation could take the survey independently
- Same participant number could complete survey multiple times

### **After (Participant-Based)** ✅
- Survey completion tracked by actual record existence in `demographic_surveys` table
- One survey per participant number across all devices/installations
- Database enforces one-to-one relationship

## 🔧 **Technical Implementation**

### **1. Login Check**
```typescript
// Check if demographic survey exists in demographic_surveys table
const { data: surveyData, error: surveyError } = await supabase
  .from('demographic_surveys')
  .select('id')
  .eq('participant_id', parsedNumber)
  .single();

// Survey is completed if there's a record in demographic_surveys table
const hasDemographicSurveyCompleted = !surveyError && !!surveyData;
```

### **2. Screen Load Check**
- When `DemographicSurveyScreen` loads, it checks for existing survey
- If found, shows alert and redirects to home
- Prevents duplicate survey attempts

### **3. Submission Check**
- Double-checks before submission to prevent race conditions
- Ensures no duplicate surveys can be created

## 📱 **User Experience**

### **First Time (No Survey)**
1. Login with participant credentials
2. Redirected to demographic survey
3. Complete and submit survey
4. Redirected to home screen

### **Subsequent Logins (Survey Exists)**
1. Login with same participant credentials on any device
2. System detects existing survey
3. Skip survey, go directly to home screen

### **Attempt to Access Survey Again**
1. If user somehow reaches survey screen
2. System checks for existing survey
3. Shows "Already Completed" message
4. Redirects to home screen

## 🗄️ **Database Schema**

```sql
-- Primary relationship is through demographic_surveys table
participants (participant_number) ← demographic_surveys (participant_id)

-- The demographic_survey_completed flag in participants table is now unused
-- Survey completion determined by record existence in demographic_surveys
```

## ✅ **Benefits**

1. **Data Integrity**: One survey per participant number
2. **Cross-Device**: Works across multiple devices/installations
3. **Prevents Duplicates**: No duplicate survey entries
4. **Consistent Experience**: Same experience regardless of device

## 🔍 **Validation**

To verify this works:

1. **Test 1**: Complete survey on Device A with participant number 123
2. **Test 2**: Login with same participant number 123 on Device B
3. **Expected**: Skip survey, go directly to home screen
4. **Database**: Only one record in `demographic_surveys` for participant 123

This ensures the research study maintains data integrity with one demographic survey per participant! 🎯
