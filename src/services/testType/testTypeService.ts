import axios from "@/lib/axios";

export interface TestType {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: string; // e.g., "3-5 days"
  [key: string]: any;
}

export interface TestTypesResponse {
  code: number;
  data: {
    testTypes: TestType[];
  };
  message: string;
  timestamp: string;
}

class TestTypeService {
  /**
   * Get all available test types
   */
  async getAllTestTypes(): Promise<TestTypesResponse> {
    const response = await axios.get("/api/v1/test-types");
    return response.data;
  }

  /**
   * Get single test type by ID
   */
  async getTestTypeById(id: number): Promise<any> {
    const response = await axios.get(`/api/v1/test-types/${id}`);
    return response.data;
  }
}

export default new TestTypeService();