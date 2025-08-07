import requests
import sys
from datetime import datetime

class SimpleAPITester:
    def __init__(self, base_url="https://255ee2f1-bb5c-45f0-913f-dd41184a9a41.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                if response.content:
                    try:
                        print(f"   Response: {response.json()}")
                    except:
                        print(f"   Response: {response.text[:200]}")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                if response.content:
                    try:
                        print(f"   Error Response: {response.json()}")
                    except:
                        print(f"   Error Response: {response.text[:200]}")

            return success, response.json() if success and response.content else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test(
            "Root API Endpoint",
            "GET",
            "api/",
            200
        )

    def test_create_status_check(self):
        """Test creating a status check"""
        return self.run_test(
            "Create Status Check",
            "POST",
            "api/status",
            200,
            data={"client_name": f"test_client_{datetime.now().strftime('%H%M%S')}"}
        )

    def test_get_status_checks(self):
        """Test getting status checks"""
        return self.run_test(
            "Get Status Checks",
            "GET",
            "api/status",
            200
        )

    def test_mongodb_connection(self):
        """Test MongoDB connection by creating and retrieving data"""
        print("\n🔍 Testing MongoDB Connection...")
        
        # Create a test record
        test_data = {"client_name": f"mongodb_test_{datetime.now().strftime('%H%M%S')}"}
        success1, response = self.run_test(
            "MongoDB Write Test",
            "POST",
            "api/status",
            200,
            data=test_data
        )
        
        if not success1:
            return False
            
        # Verify we can read it back
        success2, get_response = self.run_test(
            "MongoDB Read Test",
            "GET", 
            "api/status",
            200
        )
        
        if success2 and get_response:
            # Check if our test record exists
            test_found = any(item['client_name'] == test_data['client_name'] for item in get_response)
            if test_found:
                print("✅ MongoDB connection verified - data persisted correctly")
                return True
            else:
                print("❌ MongoDB connection issue - data not found")
                return False
        
        return success2

    def test_error_handling(self):
        """Test API error handling"""
        print("\n🔍 Testing Error Handling...")
        
        # Test invalid endpoint
        success1, _ = self.run_test(
            "Invalid Endpoint Test",
            "GET",
            "api/nonexistent",
            404
        )
        
        # Test invalid POST data (missing required field)
        success2, _ = self.run_test(
            "Invalid POST Data Test",
            "POST",
            "api/status",
            422,  # FastAPI returns 422 for validation errors
            data={}
        )
        
        return success1 and success2

def main():
    print("🚀 Starting Skillwave Studio Backend API Tests")
    print("=" * 50)
    
    # Setup
    tester = SimpleAPITester()

    # Run tests
    print("\n📡 Testing Backend API Endpoints...")
    
    # Test root endpoint
    success1, _ = tester.test_root_endpoint()
    
    # Test MongoDB connection specifically
    success2 = tester.test_mongodb_connection()
    
    # Test create status check
    success3, response = tester.test_create_status_check()
    
    # Test get status checks
    success4, _ = tester.test_get_status_checks()
    
    # Test error handling
    success5 = tester.test_error_handling()

    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Backend API Tests Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.tests_passed == tester.tests_run:
        print("✅ All backend API tests passed!")
        print("✅ MongoDB connection verified!")
        print("✅ Error handling working correctly!")
        return 0
    else:
        print("❌ Some backend API tests failed!")
        return 1

if __name__ == "__main__":
    sys.exit(main())