"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useApplyForm } from "../../apply-form-context";
import { formStyles } from "../../form-ui";
import { cn } from "@/lib/utils";

function parseAddressSelection(
  val: string,
  setContactAddress: ReturnType<typeof useApplyForm>["setContactAddress"]
) {
  if (val.includes(" » ")) {
    const parts = val.split(" » ");
    if (parts.length === 4) {
      setContactAddress((prev) => ({
        ...prev,
        addressSubdistrict: parts[0].trim(),
        addressDistrict: parts[1].trim(),
        addressProvince: parts[2].trim(),
        addressZipcode: parts[3].trim(),
      }));
      return true;
    }
  }
  return false;
}

export function StepAddress() {
  const {
    contactAddress,
    setContactAddress,
    markTouched,
    FieldError,
    fieldBorder,
    subdistrictSuggestions,
    districtSuggestions,
    zipcodeSuggestions,
    uniqueContactProvinces,
  } = useApplyForm();

  return (
    <div className={formStyles.stepSection}>
      <h2 className={formStyles.stepTitle}>ข้อมูลการติดต่อและที่อยู่</h2>
      <div className={formStyles.fieldGrid3}>
        <div className="sm:col-span-1">
          <Label className={formStyles.fieldLabel}>เบอร์โทรศัพท์ผู้สมัคร</Label>
          <Input
            type="text"
            maxLength={10}
            placeholder="กรอกเบอร์โทรศัพท์"
            value={contactAddress.phone}
            onChange={(e) =>
              setContactAddress((prev) => ({ ...prev, phone: e.target.value }))
            }
            onBlur={() => markTouched("phone")}
            className={cn(formStyles.fieldInput, "h-auto py-3", fieldBorder("phone"))}
          />
          <FieldError name="phone" />
        </div>
        <div className="sm:col-span-1">
          <Label className={formStyles.fieldLabel}>เบอร์โทรศัพท์ผู้ปกครอง</Label>
          <Input
            type="text"
            maxLength={10}
            placeholder="กรอกเบอร์ผู้ปกครอง"
            value={contactAddress.guardianPhone}
            onChange={(e) =>
              setContactAddress((prev) => ({ ...prev, guardianPhone: e.target.value }))
            }
            onBlur={() => markTouched("guardianPhone")}
            className={cn(formStyles.fieldInput, "h-auto py-3", fieldBorder("guardianPhone"))}
          />
          <FieldError name="guardianPhone" />
        </div>
        <div className="sm:col-span-1">
          <Label className={formStyles.fieldLabel}>อีเมล</Label>
          <Input
            type="email"
            placeholder="กรอกอีเมล"
            value={contactAddress.email}
            onChange={(e) =>
              setContactAddress((prev) => ({ ...prev, email: e.target.value }))
            }
            onBlur={() => markTouched("email")}
            className={cn(formStyles.fieldInput, "h-auto py-3", fieldBorder("email"))}
          />
          <FieldError name="email" />
        </div>
      </div>

      <div className={formStyles.sectionDivider} />

      <h3 className={formStyles.sectionSubtitle}>ที่อยู่ปัจจุบันตามทะเบียนบ้าน</h3>
      <div className={formStyles.fieldGrid4}>
        <div>
          <Label className={formStyles.fieldLabel}>บ้านเลขที่</Label>
          <Input
            type="text"
            value={contactAddress.addressNo}
            onChange={(e) =>
              setContactAddress((prev) => ({ ...prev, addressNo: e.target.value }))
            }
            onBlur={() => markTouched("addressNo")}
            className={cn(formStyles.fieldInput, "h-auto py-3", fieldBorder("addressNo"))}
          />
          <FieldError name="addressNo" />
        </div>
        <div>
          <Label className={formStyles.fieldLabel}>หมู่ที่</Label>
          <Input
            type="text"
            value={contactAddress.addressMoo}
            onChange={(e) =>
              setContactAddress((prev) => ({ ...prev, addressMoo: e.target.value }))
            }
            className={cn(formStyles.fieldInput, "h-auto py-3")}
          />
        </div>
        <div>
          <Label className={formStyles.fieldLabel}>ตรอก/ซอย</Label>
          <Input
            type="text"
            value={contactAddress.addressSoi}
            onChange={(e) =>
              setContactAddress((prev) => ({ ...prev, addressSoi: e.target.value }))
            }
            className={cn(formStyles.fieldInput, "h-auto py-3")}
          />
        </div>
        <div>
          <Label className={formStyles.fieldLabel}>ถนน</Label>
          <Input
            type="text"
            value={contactAddress.addressRoad}
            onChange={(e) =>
              setContactAddress((prev) => ({ ...prev, addressRoad: e.target.value }))
            }
            className={cn(formStyles.fieldInput, "h-auto py-3")}
          />
        </div>
        <div>
          <Label className={formStyles.fieldLabel}>ตำบล / แขวง</Label>
          <Input
            type="text"
            list="subdistrict-suggestions"
            value={contactAddress.addressSubdistrict}
            onChange={(e) => {
              const val = e.target.value;
              if (!parseAddressSelection(val, setContactAddress)) {
                setContactAddress((prev) => ({ ...prev, addressSubdistrict: val }));
              }
            }}
            onBlur={() => markTouched("addressSubdistrict")}
            className={cn(formStyles.fieldInput, "h-auto py-3", fieldBorder("addressSubdistrict"))}
          />
          <datalist id="subdistrict-suggestions">
            {subdistrictSuggestions.map((row, idx) => (
              <option key={idx} value={`${row[0]} » ${row[1]} » ${row[2]} » ${row[3]}`} />
            ))}
          </datalist>
          <FieldError name="addressSubdistrict" />
        </div>
        <div>
          <Label className={formStyles.fieldLabel}>อำเภอ / เขต</Label>
          <Input
            type="text"
            list="district-suggestions"
            value={contactAddress.addressDistrict}
            onChange={(e) => {
              const val = e.target.value;
              if (!parseAddressSelection(val, setContactAddress)) {
                setContactAddress((prev) => ({ ...prev, addressDistrict: val }));
              }
            }}
            onBlur={() => markTouched("addressDistrict")}
            className={cn(formStyles.fieldInput, "h-auto py-3", fieldBorder("addressDistrict"))}
          />
          <datalist id="district-suggestions">
            {districtSuggestions.map((row, idx) => (
              <option key={idx} value={`${row[0]} » ${row[1]} » ${row[2]} » ${row[3]}`} />
            ))}
          </datalist>
          <FieldError name="addressDistrict" />
        </div>
        <div>
          <Label className={formStyles.fieldLabel}>จังหวัด</Label>
          <Input
            type="text"
            list="contact-province-suggestions"
            value={contactAddress.addressProvince}
            onChange={(e) =>
              setContactAddress((prev) => ({ ...prev, addressProvince: e.target.value }))
            }
            onBlur={() => markTouched("addressProvince")}
            className={cn(formStyles.fieldInput, "h-auto py-3", fieldBorder("addressProvince"))}
          />
          <datalist id="contact-province-suggestions">
            {uniqueContactProvinces.map((prov) => (
              <option key={prov} value={prov} />
            ))}
          </datalist>
          <FieldError name="addressProvince" />
        </div>
        <div>
          <Label className={formStyles.fieldLabel}>รหัสไปรษณีย์</Label>
          <Input
            type="text"
            maxLength={5}
            list="zipcode-suggestions"
            value={contactAddress.addressZipcode}
            onChange={(e) => {
              const val = e.target.value;
              if (!parseAddressSelection(val, setContactAddress)) {
                setContactAddress((prev) => ({
                  ...prev,
                  addressZipcode: val.replace(/[^0-9]/g, ""),
                }));
              }
            }}
            onBlur={() => markTouched("addressZipcode")}
            className={cn(formStyles.fieldInput, "h-auto py-3", fieldBorder("addressZipcode"))}
          />
          <datalist id="zipcode-suggestions">
            {zipcodeSuggestions.map((row, idx) => (
              <option key={idx} value={`${row[0]} » ${row[1]} » ${row[2]} » ${row[3]}`} />
            ))}
          </datalist>
          <FieldError name="addressZipcode" />
        </div>
      </div>
    </div>
  );
}
