//backend/src/modules/countries/countries.controller.js

import { asyncHandler } from "../../utils/errorHandling.js";
import axios from 'axios';



/**-----------------------------------------------
 * @desc    Get All Countries in Arabic (Alternative Products) Replacing Israel 
 * @route   /api/countries/Replace/Israel
 * @method  GET
 * @access  public
 ------------------------------------------------*/
export const getAllCountriesReplaceIsrael = asyncHandler(async (req, res) => {
    try {
        const response = await axios.get('https://restcountries.com/v3.1/all');
        let countries = response.data.map(country => {
            let countryName = country.translations.ara.common;
            // Remove the [U+200F] character
            countryName = countryName.replace(/\u200F/g, '');
            // Exchange "اسرائيل" for the "الداخل الفلسطيني المحتل"
            if (countryName === 'إسرائيل') {
                countryName = 'الداخل الفلسطيني المحتل';
            }
            return countryName;
        });
        res.status(200).json(countries);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch countries' });
    }
});

/**-----------------------------------------------
 * @desc    Get All Countries in Arabic Exclude 'Palestine' (Supportive Products)
 * @route   /api/countries/exclude/palestine
 * @method  GET
 * @access  public
 ------------------------------------------------*/
export const getAllCountriesExcludePalestine = asyncHandler(async (req, res) => {
    try {
        const response = await axios.get('https://restcountries.com/v3.1/all');
        let countries = response.data.map(country => {
            let countryName = country.translations.ara.common;
            // Remove the [U+200F] character
            countryName = countryName.replace(/\u200F/g, '');
            return countryName;
        });
        // Remove the specified country
        countries = countries.filter(country => country !== 'فلسطين');
        res.status(200).json(countries);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch countries' });
    }
});




